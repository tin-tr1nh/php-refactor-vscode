import { Param } from "./model/Param";


export function generate(description: string, params: string[]) {
    const paramComment = genParamComment(toParams(params));

    let comment = `/**
 *
 * ${description}
 *${paramComment}
 *
 * @return      type
 *
 */\n`;
    return comment;
}

function toParams(params: string[]): Param[] {
    return params.map(param => {
        return {
            name: param,
            type: "type"
        };
    });
}

function genParamComment(params: Param[]): string {
    let comment = "";
    params.forEach(param => {
        comment += `\n * @param    ${param.type}  $${param.name} Description`;
    });

    return comment;
}