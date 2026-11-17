import { EnvironmentProviders, makeEnvironmentProviders, Type } from '@angular/core';
import { CORE_FORM_STORE, FormStoreService } from '../persistence/types';
import { LocalFormStoreService } from '../persistence/local-form-store.service';
import { BuilderEngineService } from './builder-engine.service';
import { BuilderFieldStateService } from './builder-field-state.service';
import { BUILDER_ENGINE_CONFIG, BuilderEngineConfig } from './types';

/** Provide an isolated editor engine without configuring a UI shell or a Formly runtime. */
export function provideBuilderEngine(config: BuilderEngineConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: BUILDER_ENGINE_CONFIG, useValue: config },
    { provide: CORE_FORM_STORE, useClass: config.formStore ?? LocalFormStoreService },
    BuilderEngineService,
    BuilderFieldStateService,
  ]);
}

export function provideFormStore(service: Type<FormStoreService>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CORE_FORM_STORE,
      useExisting: service,
    },
  ]);
}

export function provideLocalFormStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CORE_FORM_STORE,
      useClass: LocalFormStoreService,
    },
  ]);
}
