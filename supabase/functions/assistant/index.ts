import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are the WorkNexus Assistant, a helpful guide for a gig-work platform that connects businesses with flexible workers (pickers, packers, forklift operators, drivers) during workforce shortages.

The user may be a recruiter (posting jobs, searching workers, hiring) or a worker (browsing jobs, applying, checking in).

Rules:
- Use very simple, short sentences. Many users may not read English well.
- Be friendly and encouraging.
- Keep answers under 3 sentences when possible.
- If asked about something outside WorkNexus, gently redirect back.
- You can explain: posting a job, searching workers, hiring, ratings, availability toggle, applying for jobs, Working IDs, checking in, language toggle, voice input.
- Refer to skills as: picker (packing items), packer (packing boxes), forklift (driving forklift), driver (driving delivery vehicle).
- Available in English and Tamil context.`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      // Fallback: rule-based simple answers when no LLM key is configured
      const fallback = generateFallback(message, context);
      return new Response(
        JSON.stringify({ reply: fallback }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(message, context) },
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(
        JSON.stringify({ reply: generateFallback(message, context) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I did not understand. Please try again.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildPrompt(message: string, context: string): string {
  return `${context ? "The user is currently on this screen: " + context + ". " : ""}User question: ${message}`;
}

function generateFallback(message: string, context: string): string {
  const q = (message || "").toLowerCase();
  const ctx = (context || "").toLowerCase();

  if (q.includes("post") || q.includes("create job") || q.includes("add job")) {
    return "To post a job: tap 'Post a Job'. Fill the job title, pick a skill, choose your zone, and set how many workers you need. Then tap Submit.";
  }
  if (q.includes("search") || q.includes("find worker")) {
    return "Go to 'Search Workers'. Pick a skill and zone. Only workers who are free right now will show. Best-rated workers appear first.";
  }
  if (q.includes("hire") || q.includes("accept")) {
    return "To hire a worker: tap 'Accept' next to their name. Or tap 'Hire All' to hire every worker shown. The worker gets a Working ID right away.";
  }
  if (q.includes("working id") || q.includes("id")) {
    return "A Working ID is given only after the recruiter accepts you. It looks like WN-ABC123. You will see it in your Notifications.";
  }
  if (q.includes("apply") || q.includes("job board")) {
    return "Go to 'Job Board'. Tap a job to see details. Then tap 'Apply'. Your status will show 'Applied — waiting for the manager to accept.'";
  }
  if (q.includes("check") || q.includes("arrived") || q.includes("attendance")) {
    return "After you are hired, tap 'I have arrived' to check in. The recruiter will see that you have arrived.";
  }
  if (q.includes("rating") || q.includes("star")) {
    return "After a worker checks in, the recruiter gives 1 to 5 stars. More stars means you show up higher in search results.";
  }
  if (q.includes("available") || q.includes("free") || q.includes("toggle")) {
    return "Turn on the 'Free to work' toggle to show in recruiter searches. Turn it off when you are busy.";
  }
  if (q.includes("voice") || q.includes("speak") || q.includes("microphone")) {
    return "On the profile form, tap the microphone icon and speak. Your words will be typed for you. Tap the speaker icon to hear job details read aloud.";
  }
  if (q.includes("language") || q.includes("tamil")) {
    return "Tap the language button at the top to switch between English and Tamil. All text will change.";
  }
  if (q.includes("block") || q.includes("report")) {
    return "Tap 'Report' or 'Block' on a worker's card. Blocked workers will never show in your searches again.";
  }
  if (q.includes("upload") || q.includes("id proof") || q.includes("verify")) {
    return "In your profile, tap 'Upload ID'. Once uploaded, you get an 'ID Verified' badge. Recruiters trust you more.";
  }
  if (q.includes("shortage") || q.includes("cover")) {
    return "On your postings page, each job shows workers needed vs hired. Green means covered. Yellow means partial shortage. Red means critical shortage.";
  }
  if (q.includes("notification")) {
    return "Check the bell icon at the top. You will see messages when you are hired, with your Working ID.";
  }
  if (ctx.includes("login") || q.includes("login") || q.includes("sign")) {
    return "Pick 'I am a Recruiter' or 'I am Looking for Work'. Enter your email and password. If new, tap Sign Up first.";
  }

  return "I am here to help you use WorkNexus. You can ask me about: posting jobs, searching workers, hiring, applying, your Working ID, checking in, ratings, or changing language.";
}
