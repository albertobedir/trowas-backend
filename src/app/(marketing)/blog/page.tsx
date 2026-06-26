import { createWebflowPage } from "@/lib/webflow/create-webflow-page";

const { Page, metadata } = createWebflowPage("blog");
export { metadata };
export default Page;
