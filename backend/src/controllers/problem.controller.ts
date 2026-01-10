import { Request, Response } from "express";
import { Problem } from "../models/problem/Problem";
import { ProblemDescription } from "../models/problem/ProblemDescription";
import { ProblemExample } from "../models/problem/ProblemExample";
import { ProblemTestcase } from "../models/problem/ProblemTestcase";
import { ProblemBoilerplate } from "../models/problem/ProblemBoilerplate";
import { ProblemTag } from "../models/problem/ProblemTags";
import { ProblemCompanyTag } from "../models/problem/ProblemCompanyTag";
import { ProblemStats } from "../models/problem/ProblemStats";
import { Preferences } from "../models/user/Preferences";
import { createProblemSchema, updateProblemSchema } from "../validations/problem.schema";
import Submission from "../models/submission/Submission";
import { Verdict } from "../models/submission/verdict";

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

// Helper function to get complete problem data with all related models
const getCompleteProblemData = async (problemId: any) => {
  const problem = await Problem.findById(problemId)
    .select("-__v")
    .populate("createdBy", "username email");

  if (!problem) return null;

  const [description, examples, testcases, boilerplates, tags, companyTags, stats] =
    await Promise.all([
      ProblemDescription.findOne({ problem: problemId }).select("-__v"),
      ProblemExample.find({ problem: problemId }).select("-__v -problem"),
      ProblemTestcase.find({ problem: problemId }).select("-__v -problem"),
      ProblemBoilerplate.find({ problem: problemId }).select("-__v -problem"),
      ProblemTag.find({ problem: problemId }).select("-__v -problem"),
      ProblemCompanyTag.find({ problem: problemId }).select("-__v -problem"),
      ProblemStats.findOne({ problem: problemId }).select("-__v -problem"),
    ]);

  return {
    ...problem.toObject(),
    description: description?.description || "",
    constraints: description?.constraints || [],
    examples: examples || [],
    testcases: testcases || [],
    boilerplates: boilerplates || [],
    tags: tags.map((t) => t.tag) || [],
    companyTags: companyTags.map((ct) => ct.company) || [],
    stats: stats || { totalSubmissions: 0, acceptedSubmissions: 0 },
  };
};

// CREATE - Create a new problem with all related data
export const createProblem = async (req: Request, res: Response) => {
  try {
    const parsed = createProblemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      title,
      slug,
      difficulty,
      description,
      constraints = [],
      examples = [],
      testcases,
      boilerplates = [],
      tags = [],
      companyTags = [],
    } = parsed.data;
    const userId = (req as any).user._id;

    // Generate slug if not provided
    const problemSlug = slug || generateSlug(title);

    // Check if slug already exists
    const existingProblem = await Problem.findOne({ slug: problemSlug });
    if (existingProblem) {
      return res.status(400).json({
        success: false,
        message: "A problem with this slug already exists",
      });
    }

    // Create the main problem
    const problem = await Problem.create({
      title,
      slug: problemSlug,
      difficulty,
      createdBy: userId,
    });

    // Create problem description
    await ProblemDescription.create({
      problem: problem._id,
      description,
      constraints,
    });

    // Create problem examples
    if (examples.length > 0) {
      await ProblemExample.insertMany(
        examples.map((example) => ({
          problem: problem._id,
          input: example.input,
          output: example.output,
          explanation: example.explanation,
        }))
      );
    }


    // Create problem testcases
    if (testcases && testcases.length > 0) {
      await ProblemTestcase.insertMany(
        testcases.map((testcase) => ({
          problem: problem._id,
          input: testcase.input,
          output: testcase.output,
          isHidden: testcase.isHidden,
        }))
      );
    }

    // Create problem boilerplates
    if (boilerplates.length > 0) {
      await ProblemBoilerplate.insertMany(
        boilerplates.map((boilerplate) => ({
          problem: problem._id,
          language: boilerplate.language,
          userCodeTemplate: boilerplate.userCodeTemplate,
          fullCodeTemplate: boilerplate.fullCodeTemplate
        }))
      );
    }

    // Create problem tags
    if (tags.length > 0) {
      await ProblemTag.insertMany(
        tags.map((tag) => ({
          problem: problem._id,
          tag,
        }))
      );
    }

    // Create company tags
    if (companyTags.length > 0) {
      await ProblemCompanyTag.insertMany(
        companyTags.map((company) => ({
          problem: problem._id,
          company,
        }))
      );
    }

    // Initialize problem stats
    await ProblemStats.create({
      problem: problem._id,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
    });

    // Fetch the complete problem with all related data
    const completeProblem = await getCompleteProblemData(problem._id);

    return res.status(201).json({
      success: true,
      message: "Problem created successfully",
      data: completeProblem,
    });
  } catch (error: any) {
    console.log("Error in createProblem", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A problem with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// READ - Get all problems with optional filtering
export const getProblems = async (req: Request, res: Response) => {
  try {
    const { difficulty, page = 1, limit = 10, search, tags, companies, status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};
    if (difficulty && ["easy", "medium", "hard"].includes(difficulty as string)) {
      query.difficulty = difficulty;
    }

    query.published = true; // Ensure only published problems are shown

    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: "i" } },
        { slug: { $regex: search as string, $options: "i" } },
      ];
    }

    // Filter by Tags (Intersection: Problem must have ALL selected tags)
    if (tags) {
      const tagList = (tags as string).split(",").map(t => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        // Find problems that have these tags
        const matchedTagProblems = await ProblemTag.aggregate([
          { $match: { tag: { $in: tagList } } },
          { $group: { _id: "$problem", matchedCount: { $sum: 1 } } },
          { $match: { matchedCount: tagList.length } } // Ensure all tags match
        ]);
        const problemIds = matchedTagProblems.map(p => p._id);

        // If we already have criteria (like search), we need to intersect
        if (query._id) {
          query._id = { $in: query._id["$in"].filter((id: any) => problemIds.some((pid: any) => pid.equals(id))) };
        } else {
          query._id = { $in: problemIds };
        }
      }
    }

    // Filter by Companies (Union: Problem matches ANY selected company - standard behavior usually, let's do Union for companies)
    // Actually typically filtering is intersection for tags, but union for companies is common too.
    // Let's stick to Intersection for consistency if multi-select, OR Union if that's more intuitive.
    // Let's do Union for companies (any of the selected companies).
    if (companies) {
      const companyList = (companies as string).split(",").map(c => c.trim()).filter(Boolean);
      if (companyList.length > 0) {
        const matchedCompanyProblems = await ProblemCompanyTag.find({
          company: { $in: companyList }
        }).distinct("problem");

        // Intersect with existing ID filter if any
        if (query._id) {
          // query._id might be { $in: [...] }
          if (query._id["$in"]) {
            const existingIds = query._id["$in"];
            // Intersection of strings/objectIds is tricky, helper needed?
            // Mongoose handles ObjectId vs String usually well in $in
            query._id = { $in: existingIds.filter((id: any) => matchedCompanyProblems.some((pid: any) => pid.toString() === id.toString())) };
          } else {
            query._id = { $in: matchedCompanyProblems };
          }
        } else {
          query._id = { $in: matchedCompanyProblems };
        }
      }
    }

    // Solved Status Logic
    let solvedProblemIds: string[] = [];
    const userId = (req as any).user?._id;

    // Fetch solved problems if user is logged in
    if (userId) {
      const solvedSubmissions = await Submission.find({
        user: userId,
        verdict: Verdict.ACCEPTED
      }).distinct("problem");
      solvedProblemIds = solvedSubmissions.map(id => id.toString());
    }

    // Filter by Status (Solved/Unsolved)
    if (status && userId) {
      if (status === "solved") {
        // Must be in solvedProblemIds
        if (query._id) {
          if (query._id["$in"]) {
            const existingIds = query._id["$in"];
            query._id = { $in: existingIds.filter((id: any) => solvedProblemIds.includes(id.toString())) };
          } else {
            query._id = { $in: solvedProblemIds };
          }
        } else {
          query._id = { $in: solvedProblemIds };
        }
      } else if (status === "unsolved") {
        // Must NOT be in solvedProblemIds
        if (query._id) {
          if (query._id["$in"]) {
            const existingIds = query._id["$in"];
            query._id = { $in: existingIds.filter((id: any) => !solvedProblemIds.includes(id.toString())) };
          } else {
            query._id = { $nin: solvedProblemIds };
          }
        } else {
          query._id = { $nin: solvedProblemIds };
        }
      }
    }

    // Get problems with pagination
    const problems = await Problem.find(query)
      .select("-__v")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Fetch tags and companies for the fetched problems to display in UI
    const problemIds = problems.map(p => p._id);

    // Parallel fetch for efficiency
    const [allTags, allCompanies] = await Promise.all([
      ProblemTag.find({ problem: { $in: problemIds } }),
      ProblemCompanyTag.find({ problem: { $in: problemIds } })
    ]);

    // Attach metadata to problems
    // We need to return a slightly richer object than the Mongoose document
    const enrichedProblems = problems.map(problem => {
      const p: any = problem.toObject();
      return {
        ...p,
        tags: allTags.filter(t => t.problem.toString() === p._id.toString()).map(t => t.tag),
        companies: allCompanies.filter(c => c.problem.toString() === p._id.toString()).map(c => c.company),
        isSolved: solvedProblemIds.includes(p._id.toString())
      };
    });

    // Get total count
    const total = await Problem.countDocuments(query);

    return res.json({
      success: true,
      data: enrichedProblems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log("Error in getProblems", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET FILTERS - Get unique tags and companies
export const getProblemFilters = async (req: Request, res: Response) => {
  try {
    const [tags, companies] = await Promise.all([
      ProblemTag.distinct("tag"),
      ProblemCompanyTag.distinct("company")
    ]);

    return res.json({
      success: true,
      data: {
        tags: tags.sort(),
        companies: companies.sort()
      }
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch filters"
    });
  }
};


export const getAdminProblems = async (req: Request, res: Response) => {
  try {
    const { difficulty, page = 1, limit = 10, search } = req.query;

    // Build query
    const query: any = {};
    if (difficulty && ["easy", "medium", "hard"].includes(difficulty as string)) {
      query.difficulty = difficulty;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: "i" } },
        { slug: { $regex: search as string, $options: "i" } },
      ];
    }


    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get problems with pagination
    const problems = await Problem.find(query)
      .select("-__v")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Problem.countDocuments(query);

    return res.json({
      success: true,
      data: problems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log("Error in getAdminProblems", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// READ ONE - Get a single problem by ID or slug with all related data
export const getProblem = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const user = (req as any).user;

    const problem = await Problem.findOne({ slug }).select("-__v -createdAt -updatedAt -createdBy");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const [
      description,
      examples,
      testcases, // ✅ already filtered
      boilerplates,
      tags,
      companyTags,
      preferences

    ] = await Promise.all([
      ProblemDescription.findOne({ problem: problem._id }).select("-__v"),
      ProblemExample.find({ problem: problem._id }).select("-__v -problem -createdAt -updatedAt"),

      // ✅ ONLY visible testcases
      ProblemTestcase.find({
        problem: problem._id,
        isHidden: false,
      }).select("-__v -problem -createdAt -updatedAt -isHidden"),

      ProblemBoilerplate.find({ problem: problem._id }).select("-__v -problem -fullCodeTemplate -createdAt -updatedAt"),
      ProblemTag.find({ problem: problem._id }).select("-__v -problem"),
      ProblemCompanyTag.find({ problem: problem._id }).select("-__v -problem"),
      Preferences.findOne({ user: user._id }).select("-__v -user -createdAt -updatedAt"),
    ]);


    return res.json({
      success: true,
      data: {
        ...problem.toObject(),
        description: description?.description || "",
        constraints: description?.constraints || [],
        examples: examples || [],
        testcases: testcases || [],
        boilerplates: boilerplates || [],
        tags: tags.map((t) => t.tag),
        companyTags: companyTags.map((ct) => ct.company),
        preferences
      },
    });
  } catch (error) {
    console.error("Error in getProblem", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// UPDATE - Update a problem and all related data
export const updateProblem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateProblemSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const updateData = parsed.data;

    // Check if problem exists
    const existingProblem = await Problem.findById(id);
    if (!existingProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // Prepare basic problem update data
    const problemUpdateData: any = {};
    if (updateData.title) problemUpdateData.title = updateData.title;
    if (updateData.difficulty) problemUpdateData.difficulty = updateData.difficulty;

    // Handle slug update
    if (updateData.slug) {
      const slugConflict = await Problem.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });
      if (slugConflict) {
        return res.status(400).json({
          success: false,
          message: "A problem with this slug already exists",
        });
      }
      problemUpdateData.slug = updateData.slug;
    } else if (updateData.title) {
      // Generate slug from title if title is updated but slug is not
      const newSlug = generateSlug(updateData.title);
      const slugConflict = await Problem.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      problemUpdateData.slug = slugConflict
        ? `${newSlug}-${Date.now()}`
        : newSlug;
    }

    // Update main problem
    if (Object.keys(problemUpdateData).length > 0) {
      await Problem.findByIdAndUpdate(id, { $set: problemUpdateData }, { runValidators: true });
    }

    // Update description and constraints
    if (updateData.description !== undefined || updateData.constraints !== undefined) {
      const descriptionData: any = {};
      if (updateData.description !== undefined) descriptionData.description = updateData.description;
      if (updateData.constraints !== undefined) descriptionData.constraints = updateData.constraints;

      await ProblemDescription.findOneAndUpdate(
        { problem: id },
        { $set: descriptionData },
        { upsert: true, runValidators: true }
      );
    }

    // Update examples (replace all)
    if (updateData.examples !== undefined) {
      await ProblemExample.deleteMany({ problem: id });
      if (updateData.examples.length > 0) {
        await ProblemExample.insertMany(
          updateData.examples.map((example) => ({
            problem: id,
            input: example.input,
            output: example.output,
            explanation: example.explanation,
          }))
        );
      }
    }

    // Update testcases (replace all)
    if (updateData.testcases !== undefined) {
      await ProblemTestcase.deleteMany({ problem: id });
      if (updateData.testcases.length > 0) {
        await ProblemTestcase.insertMany(
          updateData.testcases.map((testcase) => ({
            problem: id,
            input: testcase.input,
            output: testcase.output,
            isHidden: testcase.isHidden,
          }))
        );
      }
    }

    // Update boilerplates (replace all)
    if (updateData.boilerplates !== undefined) {
      await ProblemBoilerplate.deleteMany({ problem: id });
      if (updateData.boilerplates.length > 0) {
        await ProblemBoilerplate.insertMany(
          updateData.boilerplates.map((boilerplate) => ({
            problem: id,
            language: boilerplate.language,
            userCodeTemplate: boilerplate.userCodeTemplate,
            fullCodeTemplate: boilerplate.fullCodeTemplate
          }))
        );
      }
    }

    // Update tags (replace all)
    if (updateData.tags !== undefined) {
      await ProblemTag.deleteMany({ problem: id });
      if (updateData.tags.length > 0) {
        await ProblemTag.insertMany(
          updateData.tags.map((tag) => ({
            problem: id,
            tag,
          }))
        );
      }
    }

    // Update company tags (replace all)
    if (updateData.companyTags !== undefined) {
      await ProblemCompanyTag.deleteMany({ problem: id });
      if (updateData.companyTags.length > 0) {
        await ProblemCompanyTag.insertMany(
          updateData.companyTags.map((company) => ({
            problem: id,
            company,
          }))
        );
      }
    }

    // Fetch the complete updated problem
    const completeProblem = await getCompleteProblemData(id);

    return res.json({
      success: true,
      message: "Problem updated successfully",
      data: completeProblem,
    });
  } catch (error: any) {
    console.log("Error in updateProblem", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A problem with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE - Delete a problem and all related data
export const deleteProblem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // Delete all related data
    await Promise.all([
      Problem.findByIdAndDelete(id),
      ProblemDescription.deleteMany({ problem: id }),
      ProblemExample.deleteMany({ problem: id }),
      ProblemTestcase.deleteMany({ problem: id }),
      ProblemBoilerplate.deleteMany({ problem: id }),
      ProblemTag.deleteMany({ problem: id }),
      ProblemCompanyTag.deleteMany({ problem: id }),
      ProblemStats.deleteMany({ problem: id }),
    ]);

    return res.json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleteProblem", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

