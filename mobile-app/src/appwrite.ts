import "react-native-url-polyfill/auto";
import { Account, Client, ID } from "appwrite";

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "6b031db40028bd8b4c38";

export const client = new Client().setEndpoint(endpoint).setProject(projectId);
export const account = new Account(client);
export { ID };
