import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom';
import { ServerStyleSheet } from 'styled-components';
import routes from './routes';

export async function render(url: string) {
  const handler = createStaticHandler(routes);
  const request = new Request(`http://localhost${url}`);
  const context = await handler.query(request);

  if (context instanceof Response)
    throw new Error(
      `SSR redirect: ${context.status} ${context.headers.get('location') ?? ''}`,
    );

  const router = createStaticRouter(handler.dataRoutes, context);
  const sheet = new ServerStyleSheet();

  try {
    const html = renderToString(
      sheet.collectStyles(
        <StaticRouterProvider router={router} context={context} />,
      ),
    );
    const styleTags = sheet.getStyleTags();
    return { html, styleTags };
  } finally {
    sheet.seal();
  }
}