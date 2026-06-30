# Streamline Pixel icon pipeline

This folder holds the wishlist, download ledger, and attribution for Streamline Pixel icons.

Workflow:
1) Populate `icons/wishlist.json` with the icons you want.
2) Run `npm run icons:fetch` and log in to Streamline when prompted.
3) Run `npm run icons:prepare` to generate PNG scales and the manifest.

Notes:
- Keep the wishlist small to stay within free-license limits.
- Do not commit cookies or credentials.
