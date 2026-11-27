export type {
  BaseEditorForm,
  BaseWorkspaceNode,
  DefaultForm,
  EditorField,
  EditorForm,
  FieldInfo,
  FieldInfoBadge,
  WorkspaceFolderNode,
  WorkspaceFormNode,
  WorkspaceHierarchy,
  WorkspaceNode,
  WorkspaceNodeType,
  WorkspaceValidation,
} from './model/types';

export { isValidationRuleName } from './model/workspace-validation';
export {
  copyBuilderSettings,
  isBuilderSettings,
  isStyleValues,
  type BuilderSettings,
  type StyleValue,
  type StyleValueList,
  type StyleValues,
} from './model/builder-settings';

export {
  addNodeToHierarchy,
  buildHierarchyFromFlatForms,
  createEmptyWorkspaceHierarchy,
  getDescendantNodeIds,
  isAncestorOf,
  moveNodeInHierarchy,
  recalculateNodePaths,
  removeNodeFromHierarchy,
  renameNodeInHierarchy,
  toggleFolderExpansion,
} from './model/workspace-hierarchy.utils';

export { LocalFormStoreService } from './persistence/local-form-store.service';
export {
  CORE_FORM_STORE,
  FormStoreRecoveryRequiredError,
  type FormStoreDataKind,
  type FormStoreRecoveryIssue,
  type FormStoreService,
} from './persistence/types';

export { BuilderEngineService } from './editor/builder-engine.service';
export { isLayoutRow, type FieldDropPosition } from './editor/field-layout';
export { BuilderFieldStateService } from './editor/builder-field-state.service';
export { provideBuilderEngine, provideFormStore, provideLocalFormStore } from './editor/provider';
export {
  BUILDER_ENGINE_CONFIG,
  type BuilderEngineConfig,
  type EngineFieldType,
  type EngineFieldPreset,
  type EngineLibrary,
  type FormLoadError,
  type PersistenceError,
} from './editor/types';
export {
  modifyPropertyTarget,
  PropertyChangeType,
  type PropertyChange,
} from './editor/property-change';
export {
  clearFieldModelValue,
  convertField,
  generateFieldId,
  generateFormId,
} from './editor/field-conversion';
