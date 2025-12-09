// Server-side API route - Root API key is safely stored here via environment variables
import { updateClaimBlocks, uploadClaimAttachment } from '../../../lib/rootApi';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb', // enough for 5 x 4MB base64 images in JSON
    },
  },
};

// This handler runs server-side only - Root API key is never exposed to client
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { claim_number } = req.query;
    const { engineer_review_of_damages, engineer_suggested_work, images = [] } = req.body || {};

    if (!claim_number) {
      return res.status(400).json({
        error: 'Claim number is required in the URL.',
      });
    }

    if (!engineer_review_of_damages || !engineer_suggested_work) {
      return res.status(400).json({
        error: 'engineer_review_of_damages and engineer_suggested_work are required.',
      });
    }

    if (!Array.isArray(images)) {
      return res.status(400).json({ error: 'images must be an array.' });
    }

    const MAX_FILES = 5;
    const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

    if (images.length > MAX_FILES) {
      return res
        .status(400)
        .json({ error: `You can upload a maximum of ${MAX_FILES} images.` });
    }

    for (const img of images) {
      if (img.size && img.size > MAX_FILE_SIZE_BYTES) {
        return res.status(400).json({
          error: `Image "${img.name}" is larger than 4MB.`,
        });
      }
    }

    // 1) Update claim blocks via Root API (server-side call with secure API key)
    await updateClaimBlocks({
      claimId: claim_number,
      engineer_review_of_damages,
      engineer_suggested_work,
    });

    // 2) Immediately upload attachments to Root API, one per image
    // Base64 files are uploaded directly - no local storage on server
    for (const image of images) {
      await uploadClaimAttachment({
        claimId: claim_number,
        image,
      });
    }

    return res.status(200).json({
      message: 'Claim blocks updated and attachments uploaded successfully.',
    });
  } catch (err) {
    console.error('Error in submit-claim API:', err);
    return res
      .status(500)
      .json({ error: err.message || 'Unexpected server error in submit-claim API.' });
  }
}

