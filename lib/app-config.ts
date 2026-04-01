export const APP_NAME = "username-claim";
export const APP_TITLE = "Username Claim Bureau";
export const APP_SUBTITLE = "Unique handle registry";
export const APP_DESCRIPTION = "Claim a unique Base username through a chrome-finish registry bureau with live availability and ownership detail.";
export const APP_URL = "https://username-claim.vercel.app";
export const BASE_APP_ID = "69cc7ac997b57b22030486dd";
export const TALENT_VERIFICATION = "e2ef86f3fc7e28a43ee3fe3d8da4d1ef076ebad7d292860d1a78c110959e56769b2dd08e6aaed1828ec24d95f4508e6a24a19d7f1de899e512022a110b70e968";
export const BUILDER_CODE = "bc_u7j1xrq7";
export const BUILDER_DATA_SUFFIX = "0x62635f75376a31787271370b0080218021802180218021802180218021";

export const MINIAPP_ICON_URL = `${APP_URL}/api/miniapp-assets/icon`;
export const MINIAPP_HERO_URL = `${APP_URL}/api/miniapp-assets/hero`;
export const MINIAPP_SPLASH_URL = `${APP_URL}/api/miniapp-assets/splash`;

export const FC_MINIAPP_CONTENT = JSON.stringify({
  version: "next",
  imageUrl: MINIAPP_HERO_URL,
  button: {
    title: "Claim Username",
    action: {
      type: "launch_miniapp",
      name: APP_NAME,
      url: APP_URL,
      splashImageUrl: MINIAPP_SPLASH_URL,
      splashBackgroundColor: "#F8FBFF",
    },
  },
});

export const accountAssociation = {
  header: process.env.FARCASTER_HEADER ?? "",
  payload: process.env.FARCASTER_PAYLOAD ?? "",
  signature: process.env.FARCASTER_SIGNATURE ?? "",
};

export const hasAccountAssociation = Boolean(
  accountAssociation.header && accountAssociation.payload && accountAssociation.signature,
);
