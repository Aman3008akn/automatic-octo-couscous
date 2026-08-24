import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireSession } from "@/lib/authz";

export async function POST(req: Request) {
  try {
    // Basic auth check
    await requireSession();
    
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "Unauthorized or failed upload" }, { status: 500 });
  }
}
