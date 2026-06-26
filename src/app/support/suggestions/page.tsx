"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { SupportPageShell } from "@/components/support/support-page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/store/user-store";
import { toast } from "sonner";

const suggestionCategories = [
  "New Feature",
  "Improvement",
  "Integration",
  "UI / UX",
  "Bug Report",
  "Other",
];

const highlights = [
  {
    title: "We read every suggestion",
    description:
      "Your feedback goes directly to our product team and helps shape upcoming releases.",
  },
  {
    title: "Share context freely",
    description:
      "Tell us what problem you're trying to solve — screenshots and workflows are welcome.",
  },
  {
    title: "Track what matters",
    description:
      "Popular requests influence our roadmap for cards, team tools, and analytics.",
  },
];

export default function SuggestionsPage() {
  const { user, fetchUser } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.category ||
      !formData.title ||
      !formData.description
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Suggestion submitted successfully.");
  };

  return (
    <SupportPageShell
      badge="Request Suggestion"
      title="Help us build what you need"
      subtitle="Share feature ideas, improvements, or integrations you'd like to see in Trowas. We use your feedback to prioritize what we ship next."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          {highlights.map((item) => (
            <Card
              key={item.title}
              className="border-black/5 bg-white shadow-sm transition-all hover:border-black/10 hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-black/90">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/55">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}

          <Card className="border-black/5 bg-[#f8fafc] shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-2 shadow-sm">
                  <Lightbulb className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black/85">
                    Need direct support instead?
                  </h3>
                  <p className="mt-1 text-sm text-black/55">
                    For account issues or urgent help, use our contact page.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-black hover:underline"
                  >
                    Go to Contact
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-black/5 bg-white shadow-sm">
          <CardContent className="p-6 md:p-8">
            {isSubmitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-semibold text-black/90">
                  Thank you for your suggestion
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-black/55">
                  We&apos;ve received your request and will review it with our
                  product team. If we need more details, we&apos;ll reach out by
                  email.
                </p>
                <Button
                  className="mt-6 rounded-full bg-black hover:bg-black/90"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData((prev) => ({
                      ...prev,
                      category: "",
                      title: "",
                      description: "",
                    }));
                  }}
                >
                  Submit another suggestion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-black/90">
                    Tell us your idea
                  </h2>
                  <p className="mt-1 text-sm text-black/55">
                    The more detail you share, the better we can understand your
                    use case.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Your full name"
                      className="border-black/10 bg-[#fafafa]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="you@company.com"
                      className="border-black/10 bg-[#fafafa]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="border-black/10 bg-[#fafafa]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {suggestionCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Suggestion title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Short summary of your idea"
                    className="border-black/10 bg-[#fafafa]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the feature, why it matters, and how you'd use it..."
                    className="min-h-[140px] border-black/10 bg-[#fafafa]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-full bg-black hover:bg-black/90 sm:w-auto sm:px-8"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Suggestion
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </SupportPageShell>
  );
}
