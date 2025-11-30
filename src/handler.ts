import { dispatch } from './router';
import { logger } from './common/logger';
import { LambdaEvent } from './dto/image.dto';
import { APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (
  event: LambdaEvent
): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  const path = event.rawPath || event.resource;
  logger.http(`${method} ${path}`);

  return dispatch(event);
};
