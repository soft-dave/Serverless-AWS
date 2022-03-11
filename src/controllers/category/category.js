import {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    ScanCommand
} from "@aws-sdk/client-dynamodb";
import { log_error } from '../../libs/utils.js';
import { success } from '../../libs/res.js';
import { v4 as Guid } from 'uuid';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export async function createCategory(event) {
    try {
        const body = JSON.parse(event.body);
        if (body) {
            const client = new DynamoDBClient({ region: process.env.REGION });
            const uuid = Guid();
            const params = {
                Item: marshall({
                    id: uuid,
                    title: body.title,
                    banner: {
                        fileId: body.fileId,
                        fileURL: body.fileURL
                    }
                }),
                ReturnConsumedCapacity: "TOTAL",
                TableName: process.env.TABLE_CATEGORIES
            };
            const command = new PutItemCommand(params);
            const data = await client.send(command);
            client.destroy();
            console.log('> data >>', data);
            return success({
                message: 'Ok',
                data: "Record created"
            })

        } else {
            return log_error({
                error: "Payload is empty for this request.",
            })
        }

    } catch (error) {
        console.log('error', error);
        return log_error(error);
    }

}

export async function updateCategory(event) {
    try {
        const client = new DynamoDBClient({ region: process.env.REGION });
        client.destroy();
        return success();
    } catch (error) {
        console.log('error', error);
        return log_error(error);
    }
}

export async function getCategories(event) {
    try {
        const client = new DynamoDBClient({ region: process.env.REGION });
        const params = {
            TableName: process.env.TABLE_CATEGORIES
        }
        const scanCommand = new ScanCommand(params);
        const { Items } = await client.send(scanCommand);
        client.destroy();
        const unmarshalItems = Items.map(item => unmarshall(item));
        return success({
            message: 'Ok',
            data: unmarshalItems
        })

    } catch (error) {
        console.log('error', error);
        return log_error(error);
    }
} 