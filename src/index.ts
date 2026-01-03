#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import * as dotenv from "dotenv";
import { FatSecretClient, FatSecretConfig } from "./client.js";

// Suppress dotenv console output
const originalLog = console.log;
console.log = () => {};
dotenv.config();
console.log = originalLog;

class FatSecretMCPServer {
  private server: Server;
  private client: FatSecretClient;
  private configPath: string;

  constructor() {
    this.server = new Server({
      name: "fatsecret-mcp-server",
      version: "0.1.0",
    });

    this.configPath = path.join(os.homedir(), ".fatsecret-mcp-config.json");
    this.client = new FatSecretClient({
      clientId: process.env.CLIENT_ID || "",
      clientSecret: process.env.CLIENT_SECRET || "",
    });

    this.setupToolHandlers();
  }

  private async loadConfig(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configPath, "utf-8");
      const savedConfig = JSON.parse(configData);
      this.client.updateConfig(savedConfig);
    } catch {
      // Config file doesn't exist, will be created when credentials are set
    }
  }

  private async saveConfig(): Promise<void> {
    await fs.writeFile(
      this.configPath,
      JSON.stringify(this.client.getConfig(), null, 2)
    );
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "set_credentials",
            description: "Set FatSecret API credentials (Client ID and Client Secret)",
            inputSchema: {
              type: "object",
              properties: {
                clientId: { type: "string", description: "Your FatSecret Client ID" },
                clientSecret: { type: "string", description: "Your FatSecret Client Secret" },
              },
              required: ["clientId", "clientSecret"],
            },
          },
          {
            name: "start_oauth_flow",
            description: "Start the 3-legged OAuth flow to get user authorization",
            inputSchema: {
              type: "object",
              properties: {
                callbackUrl: {
                  type: "string",
                  description: 'OAuth callback URL (use "oob" for out-of-band)',
                  default: "oob",
                },
              },
            },
          },
          {
            name: "complete_oauth_flow",
            description: "Complete the OAuth flow with the authorization code/verifier",
            inputSchema: {
              type: "object",
              properties: {
                requestToken: { type: "string", description: "The request token from start_oauth_flow" },
                requestTokenSecret: { type: "string", description: "The request token secret from start_oauth_flow" },
                verifier: { type: "string", description: "The OAuth verifier from the callback or authorization page" },
              },
              required: ["requestToken", "requestTokenSecret", "verifier"],
            },
          },
          {
            name: "search_foods",
            description: "Search for foods in the FatSecret database",
            inputSchema: {
              type: "object",
              properties: {
                searchExpression: { type: "string", description: 'Search term for foods (e.g., "chicken breast", "apple")' },
                pageNumber: { type: "number", description: "Page number for results (default: 0)", default: 0 },
                maxResults: { type: "number", description: "Maximum results per page (default: 20)", default: 20 },
              },
              required: ["searchExpression"],
            },
          },
          {
            name: "get_food",
            description: "Get detailed information about a specific food item",
            inputSchema: {
              type: "object",
              properties: {
                foodId: { type: "string", description: "The FatSecret food ID" },
              },
              required: ["foodId"],
            },
          },
          {
            name: "search_recipes",
            description: "Search for recipes in the FatSecret database",
            inputSchema: {
              type: "object",
              properties: {
                searchExpression: { type: "string", description: "Search term for recipes" },
                recipeType: { type: "string", description: "Filter by recipe type (e.g., Appetizer, Breakfast, Dessert, Main Dish, Salad, Side Dish, Soup, Snack)" },
                pageNumber: { type: "number", description: "Page number for results (default: 0)", default: 0 },
                maxResults: { type: "number", description: "Maximum results per page (default: 20, max: 50)", default: 20 },
              },
              required: ["searchExpression"],
            },
          },
          {
            name: "get_recipe",
            description: "Get detailed information about a specific recipe",
            inputSchema: {
              type: "object",
              properties: {
                recipeId: { type: "string", description: "The FatSecret recipe ID" },
              },
              required: ["recipeId"],
            },
          },
          {
            name: "get_user_profile",
            description: "Get the authenticated user's profile information",
            inputSchema: { type: "object", properties: {} },
          },
          {
            name: "get_user_food_entries",
            description: "Get user's food diary entries for a specific date",
            inputSchema: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date in YYYY-MM-DD format (default: today)" },
              },
            },
          },
          {
            name: "add_food_entry",
            description: "Add a food entry to the user's diary",
            inputSchema: {
              type: "object",
              properties: {
                foodId: { type: "string", description: "The FatSecret food ID" },
                foodName: { type: "string", description: "Name/description of the food item" },
                servingId: { type: "string", description: "The serving ID for the food" },
                quantity: { type: "number", description: "Quantity of the serving" },
                mealType: { type: "string", description: "Meal type (breakfast, lunch, dinner, other)", enum: ["breakfast", "lunch", "dinner", "other"] },
                date: { type: "string", description: "Date in YYYY-MM-DD format (default: today)" },
              },
              required: ["foodId", "foodName", "servingId", "quantity", "mealType"],
            },
          },
          {
            name: "check_auth_status",
            description: "Check if the user is authenticated with FatSecret",
            inputSchema: { type: "object", properties: {} },
          },
          {
            name: "get_weight_month",
            description: "Get user's weight entries for a specific month",
            inputSchema: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date in YYYY-MM-DD format to specify the month (default: current month)" },
              },
            },
          },
          {
            name: "edit_food_entry",
            description: "Edit an existing food diary entry",
            inputSchema: {
              type: "object",
              properties: {
                foodEntryId: { type: "string", description: "The food entry ID to edit" },
                foodName: { type: "string", description: "New name/description for the food entry" },
                servingId: { type: "string", description: "New serving ID" },
                quantity: { type: "number", description: "New quantity" },
                mealType: { type: "string", description: "New meal type (breakfast, lunch, dinner, other)", enum: ["breakfast", "lunch", "dinner", "other"] },
              },
              required: ["foodEntryId"],
            },
          },
          {
            name: "delete_food_entry",
            description: "Delete a food diary entry",
            inputSchema: {
              type: "object",
              properties: {
                foodEntryId: { type: "string", description: "The food entry ID to delete" },
              },
              required: ["foodEntryId"],
            },
          },
          {
            name: "get_food_entries_month",
            description: "Get summary of user's food diary entries for a month",
            inputSchema: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date in YYYY-MM-DD format to specify the month (default: current month)" },
              },
            },
          },
          {
            name: "update_weight",
            description: "Add or update a weight entry",
            inputSchema: {
              type: "object",
              properties: {
                currentWeightKg: { type: "number", description: "Current weight in kilograms" },
                date: { type: "string", description: "Date in YYYY-MM-DD format (default: today)" },
                goalWeightKg: { type: "number", description: "Goal weight in kilograms" },
                comment: { type: "string", description: "Optional comment for the weight entry" },
              },
              required: ["currentWeightKg"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await this.loadConfig();

      try {
        switch (request.params.name) {
          case "set_credentials":
            return await this.handleSetCredentials(request.params.arguments);
          case "start_oauth_flow":
            return await this.handleStartOAuthFlow(request.params.arguments);
          case "complete_oauth_flow":
            return await this.handleCompleteOAuthFlow(request.params.arguments);
          case "search_foods":
            return await this.handleSearchFoods(request.params.arguments);
          case "get_food":
            return await this.handleGetFood(request.params.arguments);
          case "search_recipes":
            return await this.handleSearchRecipes(request.params.arguments);
          case "get_recipe":
            return await this.handleGetRecipe(request.params.arguments);
          case "get_user_profile":
            return await this.handleGetUserProfile();
          case "get_user_food_entries":
            return await this.handleGetUserFoodEntries(request.params.arguments);
          case "add_food_entry":
            return await this.handleAddFoodEntry(request.params.arguments);
          case "check_auth_status":
            return await this.handleCheckAuthStatus();
          case "get_weight_month":
            return await this.handleGetWeightMonth(request.params.arguments);
          case "edit_food_entry":
            return await this.handleEditFoodEntry(request.params.arguments);
          case "delete_food_entry":
            return await this.handleDeleteFoodEntry(request.params.arguments);
          case "get_food_entries_month":
            return await this.handleGetFoodEntriesMonth(request.params.arguments);
          case "update_weight":
            return await this.handleUpdateWeight(request.params.arguments);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(
          ErrorCode.InternalError,
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    });
  }

  private async handleSetCredentials(args: any) {
    this.client.updateConfig({
      clientId: args.clientId,
      clientSecret: args.clientSecret,
    });
    await this.saveConfig();

    return {
      content: [{
        type: "text",
        text: "FatSecret API credentials have been set successfully. You can now start the OAuth flow to authenticate users.",
      }],
    };
  }

  private async handleStartOAuthFlow(args: any) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first using set_credentials");
    }

    const callbackUrl = args?.callbackUrl || "oob";
    const response = await this.client.getRequestToken(callbackUrl);

    const token = response.oauth_token as string;
    const tokenSecret = response.oauth_token_secret as string;
    const authUrl = `${this.client.authorizeUrl}?oauth_token=${token}`;

    return {
      content: [{
        type: "text",
        text: `OAuth flow started successfully!\n\nRequest Token: ${token}\nRequest Token Secret: ${tokenSecret}\n\nPlease visit this URL to authorize the application:\n${authUrl}\n\nAfter authorization, you'll receive a verifier code. Use the complete_oauth_flow tool with the request token, request token secret, and verifier to complete the authentication.`,
      }],
    };
  }

  private async handleCompleteOAuthFlow(args: any) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.getAccessToken(
      args.requestToken,
      args.requestTokenSecret,
      args.verifier
    );

    this.client.updateConfig({
      accessToken: response.oauth_token,
      accessTokenSecret: response.oauth_token_secret,
      userId: response.user_id,
    });
    await this.saveConfig();

    return {
      content: [{
        type: "text",
        text: `OAuth flow completed successfully! You are now authenticated with FatSecret.\n\nUser ID: ${response.user_id}\n\nYou can now use user-specific tools like get_user_profile, get_user_food_entries, and add_food_entry.`,
      }],
    };
  }

  private async handleSearchFoods(args: any) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.searchFoods(args.searchExpression, {
      pageNumber: args.pageNumber,
      maxResults: args.maxResults,
    });

    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetFood(args: any) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.getFood(args.foodId, {});
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleSearchRecipes(args: any) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.searchRecipes(args.searchExpression, {
      recipeTypes: args.recipeType,
      pageNumber: args.pageNumber,
      maxResults: args.maxResults,
    });

    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetRecipe(args: any) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.getRecipe(args.recipeId, {});
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetUserProfile() {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getProfile();
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetUserFoodEntries(args: any) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getFoodEntries(args?.date);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleAddFoodEntry(args: any) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.createFoodEntry({
      foodId: args.foodId,
      foodName: args.foodName,
      servingId: args.servingId,
      quantity: args.quantity,
      mealType: args.mealType,
      date: args.date,
    });

    return {
      content: [{
        type: "text",
        text: `Food entry added successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleCheckAuthStatus() {
    const config = this.client.getConfig();
    const hasCredentials = this.client.hasCredentials();
    const hasAccessToken = this.client.hasAccessToken();

    let status = "Not configured";
    if (hasCredentials && hasAccessToken) {
      status = "Fully authenticated";
    } else if (hasCredentials) {
      status = "Credentials set, authentication needed";
    }

    return {
      content: [{
        type: "text",
        text: `Authentication Status: ${status}\n\nCredentials configured: ${hasCredentials}\nUser authenticated: ${hasAccessToken}\nUser ID: ${config.userId || "N/A"}`,
      }],
    };
  }

  private async handleGetWeightMonth(args: any) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getWeightMonth(args?.date);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleEditFoodEntry(args: any) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.editFoodEntry({
      foodEntryId: args.foodEntryId,
      foodName: args.foodName,
      servingId: args.servingId,
      quantity: args.quantity,
      mealType: args.mealType,
    });

    return {
      content: [{
        type: "text",
        text: `Food entry updated successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleDeleteFoodEntry(args: any) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.deleteFoodEntry(args.foodEntryId);

    return {
      content: [{
        type: "text",
        text: `Food entry deleted successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleGetFoodEntriesMonth(args: any) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getFoodEntriesMonth(args?.date);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleUpdateWeight(args: any) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.updateWeight({
      currentWeightKg: args.currentWeightKg,
      date: args.date,
      goalWeightKg: args.goalWeightKg,
      comment: args.comment,
    });

    return {
      content: [{
        type: "text",
        text: `Weight entry updated successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("FatSecret MCP server running on stdio");
  }
}

const server = new FatSecretMCPServer();
server.run().catch(console.error);
