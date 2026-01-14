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

import mongoose from "mongoose";

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
          fullCodeTemplate: boilerplate.fullCodeTemplate,
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

    // ---------------- Solved logic ----------------
    const userId = (req as any).user?._id;
    let solvedProblemIds: string[] = [];

    if (userId) {
      const solved = await Submission.find({
        user: userId,
        verdict: Verdict.ACCEPTED,
      }).distinct("problem");

      solvedProblemIds = solved.map(id => id.toString());
    }

    // Build query
    const query: any = { published: true };

    if (difficulty && ["easy", "medium", "hard"].includes(difficulty as string)) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: "i" } },
        { slug: { $regex: search as string, $options: "i" } },
      ];
    }

    // Validate and Apply Status Filter
    if (status) {
      if (status === "solved" && userId) {
        query._id = { $in: solvedProblemIds };
      } else if (status === "unsolved" && userId) {
        query._id = { $nin: solvedProblemIds };
      }
    }

    // ---------------- Fetch problems ----------------
    const problems = await Problem.find(query)
      .select("-__v")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);


    const problemIds = problems.map(p => p._id);

    const [allTags, allCompanies] = await Promise.all([
      ProblemTag.find({ problem: { $in: problemIds } }),
      ProblemCompanyTag.find({ problem: { $in: problemIds } }),
    ]);

    const enrichedProblems = problems.map(problem => {
      const p: any = problem.toObject();
      return {
        ...p,
        tags: allTags
          .filter(t => t.problem.toString() === p._id.toString())
          .map(t => t.tag),
        companies: allCompanies
          .filter(c => c.problem.toString() === p._id.toString())
          .map(c => c.company),
        isSolved: solvedProblemIds.includes(p._id.toString()),
      };
    });

    const total = await Problem.countDocuments(query);

    // ✅ DEFINE PAGINATION OBJECT (FIX)
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    };

    return res.json({
      success: true,
      data: enrichedProblems,
      pagination,
    });
  } catch (error) {
    console.error("Error in getProblems", error);
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



    // ================= DB FETCH =================
    const problem = await Problem.findOne({ slug })
      .select("-__v -createdAt -updatedAt -createdBy");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const [
      description,
      examples,
      testcases,
      boilerplates,
      tags,
      companyTags,
      preferences,
      solvedStatus,
    ] = await Promise.all([
      ProblemDescription.findOne({ problem: problem._id }).select("-__v"),
      ProblemExample.find({ problem: problem._id }).select(
        "-__v -problem -createdAt -updatedAt"
      ),
      ProblemTestcase.find({
        problem: problem._id,
        isHidden: false,
      }).select("-__v -problem -createdAt -updatedAt -isHidden"),
      ProblemBoilerplate.find({ problem: problem._id }).select(
        "-__v -problem -fullCodeTemplate -createdAt -updatedAt"
      ),
      ProblemTag.find({ problem: problem._id }).select("-__v -problem"),
      ProblemCompanyTag.find({ problem: problem._id }).select("-__v -problem"),
      user?._id
        ? Preferences.findOne({ user: user._id }).select(
          "-__v -user -createdAt -updatedAt"
        )
        : null,
      user?._id
        ? Submission.findOne({
          user: user._id,
          problem: problem._id,
          verdict: Verdict.ACCEPTED,
        })
        : null,
    ]);

    const result = {
      ...problem.toObject(),
      description: description?.description || "",
      constraints: description?.constraints || [],
      examples: examples || [],
      testcases: testcases || [],
      boilerplates: boilerplates || [],
      tags: tags.map(t => t.tag),
      companyTags: companyTags.map(ct => ct.company),
      preferences,
      isSolved: !!solvedStatus,
    };



    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in getProblem", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// READ ONE FOR ADMIN - Get a single problem by ID with all data including hidden testcases and full templates
export const getProblemForAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ================= DB FETCH =================
    const problem = await Problem.findById(id)
      .select("-__v")
      .populate("createdBy", "username email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const [
      description,
      examples,
      testcases,
      boilerplates,
      tags,
      companyTags,
      stats,
    ] = await Promise.all([
      ProblemDescription.findOne({ problem: problem._id }).select("-__v"),
      ProblemExample.find({ problem: problem._id }).select(
        "-__v -problem"
      ),
      // Include ALL testcases (including hidden ones)
      ProblemTestcase.find({ problem: problem._id }).select(
        "-__v -problem"
      ),
      // Include fullCodeTemplate for admin
      ProblemBoilerplate.find({ problem: problem._id }).select(
        "-__v -problem"
      ),
      ProblemTag.find({ problem: problem._id }).select("-__v -problem"),
      ProblemCompanyTag.find({ problem: problem._id }).select("-__v -problem"),
      ProblemStats.findOne({ problem: problem._id }).select("-__v -problem"),
    ]);

    const result = {
      ...problem.toObject(),
      description: description?.description || "",
      constraints: description?.constraints || [],
      examples: examples || [],
      testcases: testcases || [],
      boilerplates: boilerplates || [],
      tags: tags.map(t => t.tag),
      companyTags: companyTags.map(ct => ct.company),
      stats: stats || { totalSubmissions: 0, acceptedSubmissions: 0 },
    };

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in getProblemForAdmin", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// UPDATE - Update a problem and all related data
export const updateProblem = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    // ================= FIND PROBLEM =================
    const existingProblem = await Problem.findById(id).session(session);
    if (!existingProblem) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // ================= BASIC UPDATE =================
    const problemUpdate: any = {};

    if (updateData.title) problemUpdate.title = updateData.title;
    if (updateData.difficulty) problemUpdate.difficulty = updateData.difficulty;

    // ================= SLUG HANDLING =================
    if (updateData.slug) {
      const conflict = await Problem.exists({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (conflict) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "A problem with this slug already exists",
        });
      }

      problemUpdate.slug = updateData.slug;
    } else if (updateData.title) {
      const generatedSlug = generateSlug(updateData.title);
      const conflict = await Problem.exists({
        slug: generatedSlug,
        _id: { $ne: id },
      });

      problemUpdate.slug = conflict
        ? `${generatedSlug}-${Date.now()}`
        : generatedSlug;
    }

    if (Object.keys(problemUpdate).length) {
      await Problem.updateOne(
        { _id: id },
        { $set: problemUpdate },
        { runValidators: true, session }
      );
    }

    // ================= DESCRIPTION =================
    if (
      updateData.description !== undefined ||
      updateData.constraints !== undefined
    ) {
      await ProblemDescription.findOneAndUpdate(
        { problem: id },
        {
          $set: {
            ...(updateData.description !== undefined && {
              description: updateData.description,
            }),
            ...(updateData.constraints !== undefined && {
              constraints: updateData.constraints,
            }),
          },
        },
        { upsert: true, runValidators: true, session }
      );
    }

    // ================= EXAMPLES =================
    if (updateData.examples !== undefined) {
      await ProblemExample.deleteMany({ problem: id }, { session });

      if (updateData.examples.length) {
        await ProblemExample.insertMany(
          updateData.examples.map(e => ({
            problem: id,
            input: e.input,
            output: e.output,
            explanation: e.explanation,
          })),
          { session }
        );
      }
    }

    // ================= TESTCASES =================
    if (updateData.testcases !== undefined) {
      await ProblemTestcase.deleteMany({ problem: id }, { session });

      if (updateData.testcases.length) {
        await ProblemTestcase.insertMany(
          updateData.testcases.map(t => ({
            problem: id,
            input: t.input,
            output: t.output,
            isHidden: t.isHidden,
          })),
          { session }
        );
      }
    }

    // ================= BOILERPLATES =================
    if (updateData.boilerplates !== undefined) {
      await ProblemBoilerplate.deleteMany({ problem: id }, { session });

      if (updateData.boilerplates.length) {
        await ProblemBoilerplate.insertMany(
          updateData.boilerplates.map(b => ({
            problem: id,
            language: b.language,
            userCodeTemplate: b.userCodeTemplate,
            fullCodeTemplate: b.fullCodeTemplate,
          })),
          { session }
        );
      }
    }

    // ================= TAGS =================
    if (updateData.tags !== undefined) {
      await ProblemTag.deleteMany({ problem: id }, { session });

      if (updateData.tags.length) {
        await ProblemTag.insertMany(
          updateData.tags.map(tag => ({ problem: id, tag })),
          { session }
        );
      }
    }

    // ================= COMPANY TAGS =================
    if (updateData.companyTags !== undefined) {
      await ProblemCompanyTag.deleteMany({ problem: id }, { session });

      if (updateData.companyTags.length) {
        await ProblemCompanyTag.insertMany(
          updateData.companyTags.map(company => ({
            problem: id,
            company,
          })),
          { session }
        );
      }
    }

    // ================= COMMIT =================
    await session.commitTransaction();
    session.endSession();



    // ================= RESPONSE =================
    const completeProblem = await getCompleteProblemData(id);

    return res.json({
      success: true,
      message: "Problem updated successfully",
      data: completeProblem,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Error in updateProblem", error);

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // ================= FIND PROBLEM =================
    const problem = await Problem.findById(id).session(session);

    if (!problem) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // ================= DELETE EVERYTHING =================
    await Promise.all([
      Problem.deleteOne({ _id: id }, { session }),
      ProblemDescription.deleteMany({ problem: id }, { session }),
      ProblemExample.deleteMany({ problem: id }, { session }),
      ProblemTestcase.deleteMany({ problem: id }, { session }),
      ProblemBoilerplate.deleteMany({ problem: id }, { session }),
      ProblemTag.deleteMany({ problem: id }, { session }),
      ProblemCompanyTag.deleteMany({ problem: id }, { session }),
      ProblemStats.deleteMany({ problem: id }, { session }),
    ]);

    // ================= COMMIT =================
    await session.commitTransaction();
    session.endSession();



    return res.json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Error in deleteProblem", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


