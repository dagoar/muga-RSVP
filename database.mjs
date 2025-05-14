import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
    DynamoDBDocumentClient,
    ScanCommand,
    PutCommand,
    GetCommand,
    DeleteCommand,
  } from "@aws-sdk/lib-dynamodb";
  
  const client = new DynamoDBClient({});
  
  const dynamo = DynamoDBDocumentClient.from(client);
  
  const tableName = process.env.BOT_TABLE;

  export class DB {
    static async get(key) {
      const params = {
        TableName: tableName,
        Key: {
          id: key
        },
      };
      const command = new GetCommand(params);
      return await dynamo.send(command);
    }
  
    static async put(item) {
      const params = {
        TableName: tableName,
        Item: item,
      };
      const command = new PutCommand(params);
      return await dynamo.send(command);
    }
  
    static async delete(key) {
      const params = {
        TableName: tableName,
        Key: key,
      };
      const command = new DeleteCommand(params);
      return await dynamo.send(command);
    }
  
    static async scan() {
      const params = {
        TableName: tableName,
      };
      const command = new ScanCommand(params);
      return await dynamo.send(command);
    }
  }
  