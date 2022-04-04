import { stringFromJsonBuffer } from '@opentelemetry-experiments/events/generic';

import { createEventService } from './json-event-service';

describe('JSON event factory', () => {
  it('should be able to create the same factory twice', () => {
    interface MyEvent {
      Hello: 'World';
    }
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { Hello: { type: 'string', enum: ['World'] } },
      required: ['Hello'],
      type: 'object',
    };

    const event: MyEvent = { Hello: 'World' };

    const service1 = createEventService<string, MyEvent>(schema, 'test-event', () => '', stringFromJsonBuffer);
    const service2 = createEventService<string, MyEvent>(schema, 'test-event', () => '', stringFromJsonBuffer);

    expect(service1.serialize(event)).toEqual(service2.serialize(event));
  });
});
