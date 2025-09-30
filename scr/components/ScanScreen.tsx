import { supabase } from '../lib/supabase'; // adjust path if needed

// inside onStartAnalysis / the click handler:
if (!selectedFile) {
  addLog("No file selected");
  return;
}

addLog(`Base64 length: ${base64String.length}`); // keep your existing logging if you like

// 1) Upload to Supabase
const fileName = `scan-${Date.now()}.jpg`;
const { error: upErr } = await supabase
  .storage
  .from('scans')
  .upload(fileName, selectedFile, { upsert: true, contentType: selectedFile.type || 'image/jpeg' });

if (upErr) {
  addLog("Upload error: " + upErr.message);
  return;
}

// 2) Get public URL
const { data: pub } = supabase.storage.from('scans').getPublicUrl(fileName);
const imageUrl = pub?.publicUrl;
addLog("Public URL: " + imageUrl);

// 3) Call your API with the URL
const response = await fetch("/api/analyze-product-image", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ imageUrl })
});

const result = await response.json();
addLog("Analysis complete: " + JSON.stringify(result, null, 2));
