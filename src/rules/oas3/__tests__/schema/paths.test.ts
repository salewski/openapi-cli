import { outdent } from 'outdent';
import { validateDoc } from './utils';

describe('OpenAPI Schema', () => {
  it('should not report if Path object is valid ', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com

      paths:
        '/ping':
          get:
            responses:
              '200':
                description: example description
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('should not report if Path object is empty ', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com

      paths: {}
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('should report if Path object is not present ', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "location": "#/",
          "message": "The field 'paths' must be present on this level.",
        },
      ]
    `);
  });

  it('should not report if Path object is empty ', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com

      paths: {}
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`Array []`);
  });

  //Check: no error
  it('should report if the field name is not begin with a forward slash (/) ', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com

      paths:
        'ping':
          get:
            responses:
              '200':
                description: example description
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "location": "#/paths/ping",
          "message": "Property \`ping\` is not expected here",
        },
      ]
    `);
  });

  // TODO: should be a separate rule
  it.skip('should report if paths are considered identical and invalid', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com

      paths:
        '/pets/{petId}':
          get:
            responses:
              '200':
                description: example description
        '/pets/{name}':
           get:
            responses:
              '200':
                description: example description
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('should not report valid matching URLs', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com

      paths:
        '/pets/{petId}':
          get:
            responses:
              '200':
                description: example description
        '/pets/mine':
           get:
            responses:
              '200':
                description: example description
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('should not report in case of ambiguous matching ', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com

      paths:
        '/{entity}/me':
          get:
            responses:
              '200':
                description: example description
        '/books/{id}':
          get:
            responses:
              '200':
                description: example description
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('should not report if Path Item is empty ', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com

      paths:
        '/ping': {}
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('should not report of a valid Parameter Object', async () => {
    const source = outdent`
      openapi: 3.0.2
      info:
        title: Test
        version: '1.0'

      servers:
        - url: http://google.com

      paths:
        /pet:
          parameters:
            - name: Accept-Language
              in: header
              description: "test"
              example: en-US
              required: false
              schema:
                type: string
                default: en-AU
          post:
            tags:
              - pet
            summary: Add a new pet to the store
            description: Add new pet to the store inventory.
            operationId: addPet
            responses:
              '405':
                description: Invalid input
    `;

    expect(
      await validateDoc(source, {
        spec: 'error',
      }),
    ).toMatchInlineSnapshot(`Array []`);
  });
});
