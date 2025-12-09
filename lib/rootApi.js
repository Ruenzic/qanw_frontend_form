// Root API credentials - stored server-side only via environment variables
// Never exposed to the client. Only accessible in Next.js API routes.
const ROOT_API_BASE_URL = process.env.ROOT_API_BASE_URL || 'https://sandbox.uk.rootplatform.com/v1/insurance';
const ROOT_API_KEY = process.env.ROOT_API_KEY;

// Basic helper for calling Root's API
// This function only runs server-side in Next.js API routes
async function rootFetch(path, options = {}) {
  if (!ROOT_API_KEY) {
    throw new Error('ROOT_API_KEY not set in env.');
  }

  const url = `${ROOT_API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ROOT_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Root API error (${res.status}): ${text}`);
  }

  return res.json().catch(() => ({}));
}

/**
 * Update claim blocks for a claim.
 * API Reference: https://docs.rootplatform.com/reference/update-multiple-block-states
 * PATCH /v1/insurance/claims/{claim_id}/blocks
 */
export async function updateClaimBlocks({ claimId, engineer_review_of_damages, engineer_suggested_work }) {
  const path = `/claims/${encodeURIComponent(claimId)}/blocks`;

  // Body structure based on Root Platform API docs
  // The body contains the block state keys and their values
  const body = {
    engineer_review_of_damages,
    engineer_suggested_work,
  };

  return rootFetch(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * Upload an attachment for a claim.
 * API Reference: https://docs.rootplatform.com/reference/claim-create-attachment
 * POST /v1/insurance/claims/{claim_id}/attachments
 * We're sending base64 in JSON for demo simplicity.
 */
export async function uploadClaimAttachment({ claimId, image }) {
  const { name, type, data } = image;

  const path = `/claims/${encodeURIComponent(claimId)}/attachments`;

  // Body structure based on Root Platform API docs
  // Note: Check Root API docs for exact field names - may need adjustment
  const body = {
    filename: name,
    mime_type: type,
    data_base64: data,
  };

  return rootFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

