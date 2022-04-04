import { stringFromJsonBuffer } from '@opentelemetry-experiments/events/generic';

import { createEventService } from './json-event-service';
import { JSONSchemaValidationError } from './json-serde';

describe('JSON event serde', () => {
  it('should serialize and deserialize an event', () => {
    interface MyEvent {
      Hello: 'World';
    }
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { Hello: { type: 'string', enum: ['World'] } },
      required: ['Hello'],
      type: 'object',
    };

    const service = createEventService<string, MyEvent>(schema, 'test-event', () => '', stringFromJsonBuffer);

    const event: MyEvent = { Hello: 'World' };

    const serialized = service.serialize(event).value;

    expect(serialized.toString('utf8')).toEqual('{"Hello":"World"}');
    expect(() => service.deserialize(serialized)).not.toThrowError();
    expect(service.deserialize(serialized)).toEqual(event);
  });

  it('should deserialize an object if it is a valid event', () => {
    // For event hub client, if a valid JSON object is read the Buffer already gets turned into an object

    interface MyEvent {
      Hello: 'World';
    }

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { Hello: { type: 'string', enum: ['World'] } },
      required: ['Hello'],
      type: 'object',
    };

    const myEvent = createEventService<string, MyEvent>(schema, 'test-event', () => '', stringFromJsonBuffer);

    const event: MyEvent = { Hello: 'World' };

    expect(() => myEvent.deserialize(event)).not.toThrowError();
    expect(myEvent.deserialize(event)).toEqual(event);
  });

  describe('WHEN a required field is missing', () => {
    interface MyEvent {
      field: string;
    }
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { field: { type: 'string' } },
      required: ['field'],
      type: 'object',
    };

    const service = createEventService<string, MyEvent>(schema, 'test-event', () => '', stringFromJsonBuffer);

    it('should not be deserializable', () => {
      const json = JSON.stringify({ Hello: 'world' });

      expect(() => service.deserialize(Buffer.from(json))).toThrowError(JSONSchemaValidationError);
    });

    it('should not be serializable', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => service.serialize({ Hello: 'world' } as any)).toThrowError(JSONSchemaValidationError);
    });
  });

  describe('WHEN a new required field with a default value is added to a schema', () => {
    interface V1 {
      FirstName: string;
    }

    interface V2 {
      FirstName: string;
      LastName: string;
    }

    const schemaV1 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { FirstName: { type: 'string' } },
      required: ['FirstName'],
      type: 'object',
    };
    const schemaV2 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: {
        FirstName: { type: 'string' },
        LastName: { type: 'string', default: 'Snow' },
      },
      required: ['FirstName', 'LastName'],
      type: 'object',
    };

    const serviceV1 = createEventService<string, V1>(schemaV1, 'test-event', () => '', stringFromJsonBuffer);
    const serviceV2 = createEventService<string, V2>(schemaV2, 'test-event', () => '', stringFromJsonBuffer);

    describe('WHEN reading an old event with a new consumer', () => {
      it('should be read with the default value ', () => {
        const eventV1 = serviceV1.serialize({ FirstName: 'John' });

        expect(eventV1.value.toString('utf8')).toEqual('{"FirstName":"John"}');

        const eventV1AsV2 = serviceV2.deserialize(eventV1.value);

        expect(eventV1AsV2.LastName).toBe('Snow');
      });
    });

    describe('WHEN reading a new event with a old consumer', () => {
      it('should still have the new field at runtime', () => {
        const eventV2 = serviceV2.serialize({ FirstName: 'John', LastName: 'Snow' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eventV2AsV1 = serviceV1.deserialize(eventV2.value) as any;

        expect(eventV2AsV1.LastName).toEqual('Snow');
      });
    });
  });

  describe('WHEN a new option is added to an existing enum', () => {
    interface V1 {
      Gender: 'Male' | 'Female';
    }

    interface V2 {
      Gender: 'Male' | 'Female' | 'Unknown';
    }

    const schemaV1 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { Gender: { type: 'string', enum: ['Male', 'Female'] } },
      required: ['Gender'],
      type: 'object',
    };
    const schemaV2 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { Gender: { type: 'string', enum: ['Male', 'Female', 'Unknown'] } },
      required: ['Gender'],
      type: 'object',
    };

    const serviceV1 = createEventService<string, V1>(schemaV1, 'test-event', () => '', stringFromJsonBuffer);
    const serviceV2 = createEventService<string, V2>(schemaV2, 'test-event', () => '', stringFromJsonBuffer);

    describe('WHEN reading an old event with a new consumer', () => {
      it('should be readable', () => {
        const event: V1 = { Gender: 'Female' };

        expect(serviceV2.deserialize(serviceV1.serialize(event).value)).toEqual(event);
      });
    });

    describe('WHEN reading a new event with an old consumer', () => {
      // We might be able to improve this behavior, for example by picking a v1 default value for the enum instead
      it('should not validate', () => {
        const event = serviceV2.serialize({ Gender: 'Unknown' });

        expect(() => serviceV1.deserialize(event.value)).toThrowError(JSONSchemaValidationError);
      });
    });
  });

  describe('WHEN an option is removed from an existing enum', () => {
    interface V1 {
      Gender: 'Male' | 'Female' | 'Unknown';
    }

    interface V2 {
      Gender: 'Male' | 'Female';
    }

    const schemaV1 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { Gender: { type: 'string', enum: ['Male', 'Female', 'Unknown'] } },
      required: ['Gender'],
      type: 'object',
    };

    const schemaV2 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { Gender: { type: 'string', enum: ['Male', 'Female'], default: 'Female' } },
      required: ['Gender'],
      type: 'object',
    };

    const serviceV1 = createEventService<string, V1>(schemaV1, 'test-event', () => '', stringFromJsonBuffer);
    const serviceV2 = createEventService<string, V2>(schemaV2, 'test-event', () => '', stringFromJsonBuffer);

    describe('WHEN reading an old event with a new consumer', () => {
      // We might be able to improve this behavior, for example by picking a v1 default value for the enum instead
      it('should not validate', () => {
        const event = serviceV1.serialize({ Gender: 'Unknown' });

        expect(() => serviceV2.deserialize(event.value)).toThrowError(JSONSchemaValidationError);
      });
    });

    describe('WHEN reading a new event with an old consumer', () => {
      it('should be readable', () => {
        const event: V2 = { Gender: 'Female' };

        expect(serviceV1.deserialize(serviceV2.serialize(event).value)).toEqual(event);
      });
    });
  });
});
