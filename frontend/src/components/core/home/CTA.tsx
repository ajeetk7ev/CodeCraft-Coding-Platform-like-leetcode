import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="bg-gray-950 py-20 text-center text-gray-100">
      <h2 className="text-3xl font-bold">
        Ready to level up your coding skills?
      </h2>
      <p className="text-gray-400 mt-4">
        Join thousands of developers preparing for top tech companies.
      </p>

      <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700">
        Create Free Account
      </Button>
    </section>
  );
}
