import { log_error } from '../../libs/utils.js';
import { success } from '../../libs/res.js';


export async function sign_up(event, context, callback) {

    try {
        const body = JSON.parse(event.body);
        if (body) {
            console.log('Body', body)
        }
        return success({
            message: "Ok",
            ...body
        })
    } catch (error) {
        return log_error(error);
    }

}