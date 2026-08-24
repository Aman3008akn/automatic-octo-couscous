const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log("Checking/Creating storage bucket...");
  
  const bucketName = "product-images";
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }
  
  const exists = buckets.find(b => b.name === bucketName);
  
  if (!exists) {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error("Error creating bucket:", error);
    } else {
      console.log(`Bucket '${bucketName}' created successfully.`);
    }
  } else {
    console.log(`Bucket '${bucketName}' already exists.`);
  }
}

main().catch(console.error);
