import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

const faqs = [
  {
    question: "What image formats are supported?",
    answer:
      "VidCraft supports JPG, JPEG, PNG, WebP, TIFF, BMP, and RAW formats including CR2, NEF, ARW, and DNG. Maximum file size is 20MB.",
  },
  {
    question: "How long does video generation take?",
    answer:
      "Most videos generate in 30-90 seconds depending on the AI model and video duration. Google Veo 3.1 is the fastest, while Sora 2 takes longer but produces premium quality.",
  },
  {
    question: "Can I edit the AI prompt?",
    answer:
      "Yes! When you select a video style, a prompt is auto-generated for you. You can then freely edit it to match your exact vision before generating.",
  },
  {
    question: "What's the difference between the AI models?",
    answer:
      "Each model has unique strengths. Veo 3.1 is fast and affordable. Runway Gen-4 Turbo produces cinematic quality. Kling 2.1 offers versatile motion. Sora 2 delivers premium quality with longer durations up to 20 seconds.",
  },
  {
    question: "Do free videos have a watermark?",
    answer:
      "Yes, videos generated on the free tier include a small 'VidCraft' watermark. Upgrade to any paid plan to remove watermarks from all your videos.",
  },
  {
    question: "What video formats can I download?",
    answer:
      "You can download your generated videos in MP4, WebM, or GIF format. MP4 is recommended for most use cases, while GIF is great for social media previews.",
  },
  {
    question: "Is there an API for bulk generation?",
    answer:
      "API access is available on our Enterprise plan. Contact our sales team for details on bulk generation, custom integrations, and dedicated support.",
  },
  {
    question: "How do credits work?",
    answer:
      "Each video generation costs credits based on the AI model and video duration. Free accounts get 1 credit on signup. Paid plans include monthly credits that refresh each billing cycle. Unused credits do not roll over.",
  },
];

export function FAQ() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
            Everything you need to know about VidCraft
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card px-4 border-none"
              >
                <AccordionTrigger className="text-left font-medium hover:text-gold-500 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[hsl(var(--muted-foreground))]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
