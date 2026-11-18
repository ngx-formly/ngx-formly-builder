# @ngx-formly/builder

Generated declarations for review. Update with `pnpm run update:api`.

## Package exports

```json
{
  "./styles.css": {
    "style": "./styles.css",
    "default": "./styles.css"
  },
  "./package.json": {
    "default": "./package.json"
  },
  ".": {
    "types": "./types/ngx-formly-builder.d.ts",
    "default": "./fesm2022/ngx-formly-builder.mjs"
  },
  "./ui": {
    "types": "./types/ngx-formly-builder-ui.d.ts",
    "default": "./fesm2022/ngx-formly-builder-ui.mjs"
  }
}
```

## Declarations

```ts
// types/ngx-formly-builder-ui.d.ts
import { BaseEditorForm, BaseWorkspaceNode, BuilderEngineService, CORE_FORM_STORE, DefaultForm, EditorField, EditorForm, FieldInfo, FieldInfoBadge, FormStoreDataKind, FormStoreRecoveryIssue, FormStoreRecoveryRequiredError, FormStoreService, PropertyChange, PropertyChangeType, WorkspaceFolderNode, WorkspaceFormNode, WorkspaceHierarchy, WorkspaceNode, WorkspaceNodeType, WorkspaceValidation, addNodeToHierarchy, buildHierarchyFromFlatForms, createEmptyWorkspaceHierarchy, getDescendantNodeIds, isAncestorOf, modifyPropertyTarget, moveNodeInHierarchy, provideFormStore, provideLocalFormStore, recalculateNodePaths, removeNodeFromHierarchy, renameNodeInHierarchy, toggleFolderExpansion } from "@ngx-formly/builder";
import * as i0 from "@angular/core";
import { EnvironmentProviders, InjectionToken, TrackByFunction, Type, WritableSignal } from "@angular/core";
import * as z$1 from "zod";
import z, { ZodType } from "zod";
import { ConfigOption, FormlyFieldConfig } from "@ngx-formly/core";
import { Subject } from "rxjs";
import { NgForm } from "@angular/forms";
export * from "@ngx-formly/builder";
interface BooleanPropertyConfig extends BasePropertyConfig {
    type: PropertyType.BOOLEAN;
    /**
     * When true (default), a false value clears the property from the target
     * instead of writing false. Only true is persisted.
     * @default true
     */
    clearOnFalse?: boolean;
    /**
     * When true (default), a null value clears the property from the target
     * instead of writing null.
     * @default true
     */
    clearOnEmpty?: boolean;
}
export declare const createBooleanProperty: PropertyCreator<BooleanPropertyConfig, BooleanPropertyConfig>;
interface DatePropertyConfig extends BasePropertyConfig {
    type: PropertyType.DATE;
    /**
     * When true (default), an empty value clears the property from the target
     * instead of being ignored. Set to false to leave the existing value untouched.
     * @default true
     */
    clearOnEmpty?: boolean;
}
export declare const createDateProperty: PropertyCreator<DatePropertyConfig, DatePropertyConfig>;
interface InputPropertyConfig extends BasePropertyConfig {
    type: PropertyType.INPUT;
    /**
     * HTML Input data type which controls the control's keyboard and
     * formatting behavior (e.g. 'number' restricts to numeric input).
     */
    dataType: 'email' | 'number' | 'password' | 'tel' | 'text' | 'url';
    /**
     * Placeholder text shown inside the input when the value is empty.
     */
    placeholder?: string;
    /**
     * When true (default), an empty value clears the property from the target
     * instead of writing the empty value. Set to false to persist empty values.
     * @default true
     */
    clearOnEmpty?: boolean;
}
export declare const createInputProperty: PropertyCreator<InputPropertyConfig, InputPropertyConfig>;
interface ObjectPropertyConfig extends BasePropertyConfig {
    type: PropertyType.OBJECT;
    /**
     * Child properties contained by this object property.
     */
    childProperties: PropertyConfig[];
    /**
     * Not intended for public configuration.
     * @internal
     */
    populateChildrenFromTarget?: boolean;
    /**
     * When true, the object may be collapsed/expanded in the UI.
     */
    isCollapsible?: boolean;
}
export declare const createObjectProperty: PropertyCreator<ObjectPropertyConfig, ObjectPropertyConfig>;
interface ChipsPropertyConfig extends BasePropertyConfig {
    type: PropertyType.CHIPS;
    /**
     * Placeholder text displayed in the chips input when empty.
     */
    placeholder?: string;
    /**
     * When configured, chips can be represented as a single string using
     * the provided separator on output.
     */
    outputString?: {
        /**
         * Separator used to join chips when producing a single output string.
         */
        separator: string;
    };
}
export declare const createChipsProperty: PropertyCreator<ChipsPropertyConfig, ChipsPropertyConfig>;
type CustomValidationPropertyConfig = BasePropertyConfig & {
    type: PropertyType.CUSTOM_VALIDATION;
    /**
     * Which validation key in the field this property configures.
     */
    key: 'asyncValidators.validation' | 'validators.validation';
    /**
     * Available custom validator types and their options.
     */
    validationOptions: CustomValidationOption[];
};
interface CustomValidation {
    name: string;
    options?: Record<string, unknown>;
}
interface CustomValidationOption {
    /**
     * Display label for this validator option.
     */
    label: string;
    /**
     * Value/key used to identify the validator.
     */
    value: string;
    /**
     * Optional properties describing additional configuration options
     * for this custom validator.
     */
    optionProperties?: PropertyConfig[];
}
export declare const createCustomValidationProperty: PropertyCreator<CustomValidationPropertyConfig, CustomValidationPropertyConfig>;
type ExpressionsPropertyConfig = BasePropertyConfig & {
    type: PropertyType.EXPRESSIONS;
    key: 'expressionProperties' | 'expressions' | 'widget.formlyConfig.expressionProperties' | 'widget.formlyConfig.expressions';
};
export declare const createExpressionsProperty: PropertyCreator<ExpressionsPropertyConfig, ExpressionsPropertyConfig>;
interface SelectPropertyConfig extends BasePropertyConfig {
    type: PropertyType.SELECT;
    /**
     * Available options shown in the select control.
     */
    options: SelectPropertyOption[];
    /**
     * Placeholder text when no option is selected.
     */
    placeholder?: string;
    /**
     * When true (default), an empty selection clears the property from the target
     * instead of writing null.
     * @default true
     */
    clearOnEmpty?: boolean;
}
interface SelectPropertyOption {
    /**
     * Human readable label for the option.
     */
    label: string;
    /**
     * Value stored in the model when the option is selected.
     */
    value: number | string;
}
export declare const createSelectProperty: PropertyCreator<SelectPropertyConfig, SelectPropertyConfig>;
type GroupChildPropertyConfig = BooleanPropertyConfig | InputPropertyConfig | SelectPropertyConfig;
interface GroupPropertyConfig extends BasePropertyConfig {
    type: PropertyType.GROUP;
    /** Properties rendered inside the group panel. */
    childProperties: GroupChildPropertyConfig[];
}
export declare const createGroupProperty: PropertyCreator<GroupPropertyConfig, GroupPropertyConfig>;
interface MarkdownPropertyConfig extends BasePropertyConfig {
    type: PropertyType.MARKDOWN;
    placeholder?: string;
    clearOnEmpty?: boolean;
}
export declare const createMarkdownProperty: PropertyCreator<MarkdownPropertyConfig, MarkdownPropertyConfig>;
type ValidationMessagesPropertyConfig = BasePropertyConfig & {
    type: PropertyType.VALIDATION_MESSAGES;
    key: 'validation.messages' | 'widget.formlyConfig.validation.messages';
    /**
     * List of validators that can be configured with custom messages.
     */
    validationOptions: ValidationOption[];
};
interface ValidationMessage {
    key: string;
    value: string;
}
interface ValidationOption {
    /**
     * Human readable label for the validator.
     */
    label: string;
    /**
     * Validator key used in the field/configuration.
     */
    value: string;
}
export declare const createValidationMessagesProperty: PropertyCreator<ValidationMessagesPropertyConfig, ValidationMessagesPropertyConfig>;
interface WrappersPropertyOption {
    /** Human readable wrapper label shown in the selector. */
    label: string;
    /** Wrapper name stored in the field configuration. */
    value: string;
}
interface WrappersPropertyConfig extends BasePropertyConfig {
    type: PropertyType.WRAPPERS;
    /** Wrapper options available to the selected field type. */
    options: WrappersPropertyOption[];
    /** Placeholder text shown when no wrapper is selected. */
    placeholder?: string;
    /** When true (default), an empty value clears the property from the target instead of writing the empty value. */
    clearOnEmpty?: boolean;
}
export declare const createWrappersProperty: PropertyCreator<WrappersPropertyConfig, WrappersPropertyConfig>;
export declare enum PropertyType {
    BOOLEAN = "Boolean",
    INPUT = "Input",
    MARKDOWN = "Markdown",
    DATE = "Date",
    OBJECT = "Object",
    GROUP = "Group",
    ARRAY = "Array",
    SELECT = "Select",
    CHIPS = "Chips",
    WRAPPERS = "Wrappers",
    EXPRESSIONS = "Expressions",
    VALIDATION_MESSAGES = "Validation Messages",
    CUSTOM_VALIDATION = "Custom Validation"
}
interface BasePropertyConfig {
    /**
     * Identifies the property kind.
     */
    type: PropertyType;
    /**
     * Label shown in the UI for this property.
     */
    label?: string;
    /**
     * Short description or help text used for tooltips.
     */
    description?: string;
    /**
     * Optional key or path segment associated with this property.
     */
    key?: string;
    /**
     * When true, the property may be removed by the user in the UI.
     */
    isRemovable?: boolean;
    /**
     * When true, the property's key may be edited by the user.
     */
    isKeyEditable?: boolean;
    /**
     * When true, this property is required.
     */
    isRequired?: boolean;
    /**
     * Column span used when rendering this property in a grid layout.
     */
    colSpan?: number;
}
type PropertyConfig = ArrayPropertyConfig | BooleanPropertyConfig | ChipsPropertyConfig | CustomValidationPropertyConfig | DatePropertyConfig | ExpressionsPropertyConfig | GroupPropertyConfig | InputPropertyConfig | MarkdownPropertyConfig | ObjectPropertyConfig | SelectPropertyConfig | ValidationMessagesPropertyConfig | WrappersPropertyConfig;
type PropertyCreator<T extends BasePropertyConfig, V extends BasePropertyConfig> = (property: Omit<T, 'type'>) => V;
interface ArrayPropertyConfig extends BasePropertyConfig {
    type: PropertyType.ARRAY;
    /**
     * Property for each element contained in the array.
     */
    childProperty?: PropertyConfig;
    /**
     * Whether new items can be added to the array from the UI.
     */
    canAdd?: boolean;
    /**
     * When true, the array panel may be collapsed in the UI.
     */
    isCollapsible?: boolean;
    /**
     * When true, an eligible object array can be edited in the table dialog.
     * Eligibility requires keyed Input, Boolean, or Select child properties.
     */
    useTableDialog?: boolean;
}
export declare const createArrayProperty: PropertyCreator<ArrayPropertyConfig, ArrayPropertyConfig>;
export declare const trackByPropertyKey: TrackByFunction<PropertyConfig>;
export declare function getChildPath(path: string[], key: number | string | undefined): string[];
export declare const getDefaultProperty: (type: PropertyType, key?: string, dataType?: "number" | "text", childPropertyType?: PropertyType) => PropertyConfig;
export declare const getDefaultPropertyFromValue: (value: unknown, key?: string) => PropertyConfig | undefined;
export declare const getDefaultPropertyValue: (type: PropertyType, dataType?: "number" | "text") => unknown;
/**
 * Convert an IProperty configuration to a Zod schema for validation.
 * @param property - The property configuration to convert
 * @returns A Zod schema that validates against the property structure
 */
export declare function getPropertySchema(property: PropertyConfig): z.ZodType;
type ValidationRulePropertyConfig = BooleanPropertyConfig | DatePropertyConfig | InputPropertyConfig | SelectPropertyConfig;
interface ValidationRuleConfig {
    /** Formly validator name used as the key in validation.messages. */
    name: string;
    /** Property control that configures the validator. */
    property: ValidationRulePropertyConfig;
}
interface FieldValidationConfig {
    /** Fixed built-in validation rules supported by this field type. */
    rules: ValidationRuleConfig[];
    /** Optional synchronous custom validator section. */
    customValidators?: CustomValidationPropertyConfig;
    /** Optional asynchronous custom validator section. */
    asyncValidators?: CustomValidationPropertyConfig;
    /** Additional validation display controls such as validation.show. */
    displayProperties?: PropertyConfig[];
}
export declare enum ClassType {
    CLASS_NAME = "className",
    FIELD_GROUP_CLASS_NAME = "fieldGroupClassName"
}
export declare enum BreakpointAffix {
    PREFIX = "prefix",
    INFIX = "infix",
    SUFFIX = "suffix"
}
interface StyleDependency {
    type: ClassType;
    value: string;
}
interface StyleOptionConfig {
    name: string;
    /** Explains the option without changing its generated classes. */
    description?: string;
    value?: string;
    variants: string[];
    /** Display labels keyed by variant; omitted labels fall back to the variant. */
    variantLabels?: Record<string, string>;
    hasBreakpoints?: boolean;
    spanWidth?: boolean;
    dependsOn?: StyleDependency;
    dependsOnParent?: StyleDependency;
}
interface StylesConfig {
    /** Name displayed in Builder settings. */
    label?: string;
    breakpointAffix: BreakpointAffix;
    breakpoints: Breakpoint[];
    className: StyleOptionCategory[];
    fieldGroupClassName: StyleOptionCategory[];
}
interface StyleOptionCategory {
    name: string;
    options: StyleOptionConfig[];
}
interface Breakpoint {
    name: string;
    description: string;
    value: string;
}
declare const CORE_STYLES_CONFIG: InjectionToken<StylesConfig>;
/**
 * A category of field types shown in the UI.
 */
interface FieldCategoryOption {
    /** The category label shown to users. */
    displayName: string;
    /** The field type options that belong to this category. */
    children: FieldTypeOption[];
}
interface FieldCategoryPreset {
    displayName: string;
    children: FieldTypePreset[];
}
/**
 * A field type option describing how a particular field type behaves.
 */
interface FieldTypeOption {
    isFieldArray?: boolean;
    /** Unique type name (used as `type`). */
    name: string;
    /** Human friendly name shown in the palette. */
    displayName: string;
    /** Optional description shown below the field name in the palette. */
    description?: string;
    /** Optional prefix used when generating field keys. */
    keyGenerationPrefix?: string;
    /** When true prevents automatic key generation. */
    disableKeyGeneration?: boolean;
    /** Marks the type as a container/parent type. */
    isParent?: boolean;
    /** Default Formly config used when inserting this field. */
    defaultConfig: FormlyFieldConfig;
    /** Optional wrappers available for this field type. */
    wrapperOptions?: FieldWrapperOption[];
    /** Icon identifier (UI-specific) for the type. */
    materialSymbol: string;
    /** Optional editor property descriptors for configuring this type. */
    properties?: PropertyConfig[];
    /** Optional editor configuration for validation rules and their messages. */
    validationConfig?: FieldValidationConfig;
    /** Optional preset field instances for quick insertion. */
    initialPresets?: FieldTypePreset[];
}
interface FieldTypePreset {
    id: string;
    displayName: string;
    field: FormlyFieldConfig;
    isRemovable?: boolean;
    /**
     * Not intended for public configuration.
     * @internal
     */
    typeOption?: FieldTypeOption;
}
/**
 * Wrapper (container) option description.
 */
interface FieldWrapperOption {
    /** Wrapper key used by Formly. */
    name: string;
    /** Human friendly name shown in the field editor. */
    label: string;
    /** Optional editor properties exposed for the wrapper. */
    properties?: PropertyConfig[];
}
/**
 * Global configuration for the core editor.
 */
interface LibraryConfig {
    /** Unique configuration id used to route editor operations. */
    id: string;
    /** Keep a library available for saved forms without offering it for new forms. */
    hidden?: boolean;
    /** Categories and their field types shown in the palette. */
    fieldCategoryOptions: FieldCategoryOption[];
    /** Enable JSON schema validation in the form import dialog. */
    enableFormUploadSchema?: boolean;
    formTemplates: DefaultForm[];
    label: string;
    configOptions: ConfigOption[];
    /** Optional Formly configuration loaded only for builder contexts. */
    builderConfigOptions?: ConfigOption[];
    schema: ZodType;
    /** Default type option applied to unknown types. */
    defaultTypeOption: FieldTypeOption;
}
interface CoreEditorConfig {
    editorType: string;
    defaultTypeOption: FieldTypeOption;
    /** Enable debounced persistence for active form mutations. */
    autoSave?: boolean;
    /** Delay in milliseconds before an active form mutation is persisted. */
    autoSaveDelay?: number;
    /** Show the read-only builder settings panel. Defaults to true. */
    showSettings?: boolean;
}
/** Public configuration for an embedded Formly Builder instance. */
interface FormlyBuilderConfig {
    /** Replaces the default Tailwind styling catalogue. The host supplies matching CSS. */
    styles?: StylesConfig;
    /** Show the read-only builder settings panel. Defaults to true. */
    showSettings?: boolean;
    /** Optional UI profiles. Native HTML controls are available without a UI library. */
    libraries?: LibraryConfig[];
    /** Shared templates rendered with the selected library, replacing profile-specific templates. */
    formTemplates?: FormTemplate[];
    /** Storage namespace used to isolate this editor's documents. */
    editorType?: string;
    /** Enable debounced persistence for active form mutations. Defaults to true. */
    autoSave?: boolean;
    /** Delay in milliseconds before an active form mutation is persisted. */
    autoSaveDelay?: number;
    /** Persistence implementation. Defaults to browser local storage. */
    formStore?: Type<FormStoreService>;
}
type FormTemplate = Pick<DefaultForm, 'description' | 'fields' | 'icon' | 'id' | 'model' | 'name'>;
declare const CORE_EDITOR_CONFIG: InjectionToken<CoreEditorConfig>;
export declare const CORE_LIBRARY_CONFIGS: InjectionToken<LibraryConfig[]>;
declare const CORE_FORM_TEMPLATES: InjectionToken<FormTemplate[]>;
export declare class CoreLibraryService {
    protected readonly libraryConfigs: LibraryConfig[];
    readonly formTemplates: import("@ngx-formly/builder").DefaultForm[];
    readonly libraryOptions: {
        id: string;
        label: string;
    }[];
    protected readonly activeLibrarySrc: import("@angular/core").WritableSignal<LibraryConfig | null>;
    readonly activeLibrary: import("@angular/core").Signal<LibraryConfig | null>;
    readonly activeLibraryId: import("@angular/core").Signal<null | string>;
    readonly activeLibraryLabel: import("@angular/core").Signal<null | string>;
    setActiveLibrary(libraryId: null | string): void;
    getLibraryLabel(libraryId: string): null | string;
    getLibrary(libraryId: string): LibraryConfig | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<CoreLibraryService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
interface LibraryProperties {
    presetStorageKey: string;
    fieldCategoryOptions: FieldCategoryOption[];
    fieldTypeOptions: FieldTypeOption[];
    fieldTypeMap: Record<string, FieldTypeOption>;
}
export declare class CoreFieldService {
    protected readonly editorConfig: import("@ngx-formly/builder/ui").CoreEditorConfig;
    protected readonly libraryConfigs: import("@ngx-formly/builder/ui").LibraryConfig[];
    protected readonly libraryService: CoreLibraryService;
    protected activeLibraryId: import("@angular/core").Signal<null | string>;
    protected readonly libraryPropertyMap: Record<string, LibraryProperties>;
    protected readonly basePresetStorageKey = "formly-studio-presets";
    defaultTypeOption: FieldTypeOption;
    protected readonly activeFieldTypeMap: import("@angular/core").Signal<Record<string, FieldTypeOption>>;
    readonly activeFieldCategoryOptions: import("@angular/core").Signal<{
        children: FieldTypeOption[];
        displayName: string;
    }[]>;
    readonly activeFieldTypeOptions: import("@angular/core").Signal<FieldTypeOption[]>;
    readonly classNamePath: string[];
    readonly fieldGroupClassNamePath: string[];
    readonly filterPaths: string[];
    readonly validationMessagesPath: string[];
    readonly fieldCategoryPresets: import("@angular/core").WritableSignal<FieldCategoryPreset[]>;
    constructor();
    getTypeOptions(libraryId: string): FieldTypeOption[];
    getTypeOption(type: string): FieldTypeOption | undefined;
    getDefaultField(type: string, configId: string): FormlyFieldConfig;
    getProperties(field: FormlyFieldConfig): PropertyConfig[];
    getValidationConfig(field: FormlyFieldConfig): FieldValidationConfig | undefined;
    getFieldIcon(field: EditorField): string | undefined;
    isFieldEqual(a: EditorField, b: EditorField): boolean;
    savePreset(displayName: string, field: FormlyFieldConfig): void;
    protected getFieldProperties(type: string, configProperties: LibraryProperties): PropertyConfig[];
    protected getFieldValidationConfig(type: string, configProperties: LibraryProperties): FieldValidationConfig | undefined;
    protected getWrapperProperties(wrappers: string[], typeOption: FieldTypeOption): PropertyConfig[];
    protected getTypeOptionForProperties(type: string, configProperties: LibraryProperties): FieldTypeOption;
    protected setupInitialPresets(configId: string): void;
    protected updatePresetCategories(configId: string): void;
    protected getPresetMap(configId: string): Record<string, FieldTypePreset[]>;
    protected storePresetMap(presetMap: Record<string, FieldTypePreset[]>, configId: string): void;
    getKey(field: EditorField): string;
    getKeyPath(fieldInfo: FieldInfo, fieldMap: Record<string, EditorField>): string;
    getChildIds(fieldInfo: FieldInfo): string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<CoreFieldService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
interface MenuItem {
    label?: string;
    icon?: string;
    matIcon?: string;
    warn?: boolean;
    items?: MenuItem[];
    disabled?: boolean;
    visible?: boolean;
    separator?: boolean;
    styleClass?: string;
    command?: (event: {
        item?: MenuItem;
    }) => void;
}
interface CoreAddFieldOption extends MenuItem {
    items?: CoreAddFieldOption[];
    fieldType?: string;
}
type LHSPanelType = 'add-field' | 'fields' | 'forms' | 'settings';
type RHSPanelType = 'field-edit' | 'model' | 'styling' | 'validation';
declare enum DropAction {
    COPY = "copy",
    MOVE = "move"
}
interface DragData {
    action: DropAction;
    fieldType: string;
    fieldId: string;
    index?: number;
    preset?: FieldTypePreset;
}
interface DragOverData {
    fieldId: string;
    clientX: number;
    clientY: number;
}
type FormDisplayMode = 'form' | 'json' | 'preview';
export declare class PanelService {
    readonly showSettings: boolean;
    protected readonly activePanelSrc: import("@angular/core").WritableSignal<LHSPanelType | RHSPanelType>;
    readonly activePanel: import("@angular/core").Signal<LHSPanelType | RHSPanelType>;
    protected readonly activeLHSPanelSrc: import("@angular/core").WritableSignal<LHSPanelType>;
    readonly activeLHSPanel: import("@angular/core").Signal<LHSPanelType>;
    readonly activeAddFieldTab: import("@angular/core").WritableSignal<"fields" | "presets">;
    readonly activeWorkspaceTab: import("@angular/core").WritableSignal<"forms" | "validations">;
    protected readonly activeRHSPanelSrc: import("@angular/core").WritableSignal<RHSPanelType>;
    readonly activeRHSPanel: import("@angular/core").Signal<RHSPanelType>;
    protected highlightPanelSrc$: Subject<LHSPanelType | RHSPanelType>;
    readonly highlightPanel$: import("rxjs").Observable<LHSPanelType | RHSPanelType>;
    setActivePanel(panel: LHSPanelType | RHSPanelType): void;
    setActiveLHSPanel(panel: LHSPanelType): void;
    setActiveRHSPanel(panel: RHSPanelType): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PanelService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
/** Shell facade retaining the existing editing API. */
export declare class CoreFormService extends BuilderEngineService {
    protected readonly libraryService: CoreLibraryService;
    protected readonly fieldService: CoreFieldService;
    protected readonly panelService: PanelService;
    readonly activeFormDisplayModeSrc: import("@angular/core").WritableSignal<"form" | "json" | "preview">;
    readonly activeFormDisplayMode: import("@angular/core").Signal<"form" | "json" | "preview">;
    readonly isEditMode: import("@angular/core").Signal<boolean>;
    protected readonly mouseInsideIds: import("@angular/core").WritableSignal<string[]>;
    readonly activeMouseInside: import("@angular/core").Signal<null | string>;
    readonly activeSchema: import("@angular/core").Signal<import("zod").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>> | undefined>;
    constructor();
    setMouseEnteredField(fieldId: string): void;
    setMouseLeftField(fieldId: string): void;
    setActiveFormDisplayMode(mode: 'form' | 'json' | 'preview'): void;
    getAddOptions(info: FieldInfo): CoreAddFieldOption[];
    getReplaceOptions(info: FieldInfo): CoreAddFieldOption[];
    static ɵfac: i0.ɵɵFactoryDeclaration<CoreFormService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
declare class AddFieldPanel {
    protected formService: CoreFormService;
    protected fieldService: CoreFieldService;
    activeFormId: import("@angular/core").Signal<string | undefined>;
    activeField: import("@angular/core").Signal<import("@ngx-formly/builder").EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }> | null>;
    fieldCategoryPresets: import("@angular/core").WritableSignal<FieldCategoryPreset[]>;
    readonly activeTab: import("@angular/core").WritableSignal<"fields" | "presets">;
    static ɵfac: i0.ɵɵFactoryDeclaration<AddFieldPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AddFieldPanel, "core-add-field-panel", never, {}, {}, never, never, true, never>;
}
declare class FieldEditPanel {
    protected formService: CoreFormService;
    protected fieldService: CoreFieldService;
    activeField: import("@angular/core").Signal<import("@ngx-formly/builder").EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }> | null>;
    activeFieldMap: import("@angular/core").Signal<Record<string, import("@ngx-formly/builder").EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }>>>;
    readonly headerTitle: import("@angular/core").Signal<string>;
    readonly parentField: import("@angular/core").Signal<import("@ngx-formly/builder").EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }> | null>;
    readonly activeFieldByType: import("@angular/core").Signal<import("@ngx-formly/builder").EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }> | null>;
    readonly properties: import("@angular/core").Signal<import("@ngx-formly/builder/ui").PropertyConfig[]>;
    readonly keyPath: import("@angular/core").Signal<string>;
    onFieldChanged(change: PropertyChange): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FieldEditPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FieldEditPanel, "core-field-edit-panel", never, {}, {}, never, never, true, never>;
}
declare class MouseInsideService {
    protected readonly isMoudeInsideSrc: import("@angular/core").WritableSignal<boolean>;
    readonly isMouseInside: import("@angular/core").Signal<boolean>;
    setMouseInside(isInside: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MouseInsideService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
declare class FieldsPanel {
    protected formService: CoreFormService;
    protected fieldService: CoreFieldService;
    protected panelService: PanelService;
    protected mouseInsideService: MouseInsideService;
    readonly filterValue: import("@angular/core").WritableSignal<string>;
    readonly isFiltering: import("@angular/core").Signal<boolean>;
    readonly filteredVisibleFieldIds: import("@angular/core").Signal<string[]>;
    activeFormId: import("@angular/core").Signal<string | undefined>;
    rootFieldIds: import("@angular/core").Signal<string[]>;
    openFormsPanel(): void;
    setMouseInside(isInside: boolean): void;
    clearFilter(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FieldsPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FieldsPanel, "core-fields-panel", never, {}, {}, never, never, true, never>;
}
declare const PREVIEW_DEVICE_WIDTHS: {
    readonly auto: null;
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
    readonly xl: 1280;
};
type PreviewDevicePreset = 'custom' | keyof typeof PREVIEW_DEVICE_WIDTHS;
declare class PreviewViewportService {
    private readonly presetSrc;
    private readonly customWidthSrc;
    readonly preset: import("@angular/core").Signal<PreviewDevicePreset>;
    readonly customWidth: import("@angular/core").Signal<number>;
    readonly targetWidth: import("@angular/core").Signal<null | number>;
    selectPreset(preset: PreviewDevicePreset): void;
    setCustomWidth(width: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PreviewViewportService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
declare class FormPreviewContent {
    readonly formFields: import("@angular/core").InputSignal<FormlyFieldConfig<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: any;
    }>[]>;
    protected readonly viewport: PreviewViewportService;
    private readonly applicationRef;
    private readonly environmentInjector;
    private readonly destroyRef;
    private readonly document;
    private readonly rendererFactory;
    private readonly canvas;
    private readonly previewFrame;
    private rendererRef;
    private frameInjector;
    private resizeObserver;
    private styleObserver;
    private readonly frameStyles;
    protected readonly canvasWidth: import("@angular/core").WritableSignal<number>;
    protected readonly canvasHeight: import("@angular/core").WritableSignal<number>;
    readonly scale: import("@angular/core").Signal<number>;
    protected readonly scaledWidth: import("@angular/core").Signal<string>;
    protected readonly frameWidth: import("@angular/core").Signal<string>;
    protected readonly frameHeight: import("@angular/core").Signal<number>;
    constructor();
    protected initializeFrame(): Promise<void>;
    private createFrameRendererFactory;
    private observeCanvas;
    private observeStyles;
    private syncFrameAppearance;
    private syncFrameStyles;
    private destroyRenderer;
    private destroyFrame;
    static ɵfac: i0.ɵɵFactoryDeclaration<FormPreviewContent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FormPreviewContent, "core-form-preview-content", never, {
        "formFields": {
            "alias": "formFields";
            "required": false;
            "isSignal": true;
        };
    }, {}, never, never, true, never>;
}
declare class FormPanel {
    readonly hideFormTitle: import("@angular/core").InputSignal<boolean>;
    protected formService: CoreFormService;
    protected readonly previewContent: import("@angular/core").Signal<FormPreviewContent | undefined>;
    activeFormId: import("@angular/core").Signal<string | undefined>;
    activeFormFieldsJSON: import("@angular/core").Signal<string>;
    activeFormDisplayMode: import("@angular/core").Signal<"form" | "json" | "preview">;
    schema: import("@angular/core").Signal<import("zod").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>> | undefined>;
    activePreviewFormFields$: import("rxjs").Observable<import("@ngx-formly/builder").EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }>[]>;
    displayMode$: import("rxjs").Observable<"form" | "json" | "preview">;
    previewFields$: import("rxjs").Observable<import("@ngx-formly/builder").EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }>[]>;
    setActiveFormDisplayMode(mode?: number | string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FormPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FormPanel, "core-form-panel", never, {
        "hideFormTitle": {
            "alias": "hideFormTitle";
            "required": false;
            "isSignal": true;
        };
    }, {}, never, never, true, never>;
}
export declare class CreateFormDialogService {
    protected readonly isOpenSrc: import("@angular/core").WritableSignal<boolean>;
    readonly isOpen: import("@angular/core").Signal<boolean>;
    protected readonly parentIdSrc: import("@angular/core").WritableSignal<null | string>;
    readonly parentId: import("@angular/core").Signal<null | string>;
    open(parentId?: null | string): void;
    close(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CreateFormDialogService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
declare class FormsPanel {
    private readonly panels;
    readonly activeTab: import("@angular/core").WritableSignal<"forms" | "validations">;
    protected formService: CoreFormService;
    protected mouseInsideService: MouseInsideService;
    protected createFormDialogService: CreateFormDialogService;
    private readonly importDialogService;
    private readonly document;
    formList: import("@angular/core").Signal<import("@ngx-formly/builder").BaseEditorForm[]>;
    hierarchyRootNodeIds: import("@angular/core").Signal<string[]>;
    hierarchyNodeMap: import("@angular/core").Signal<Record<string, WorkspaceNode>>;
    readonly hasStorageRecoveryIssues: import("@angular/core").Signal<boolean>;
    readonly selectedNodeIds: import("@angular/core").WritableSignal<string[]>;
    readonly filterValue: import("@angular/core").WritableSignal<string>;
    readonly isFiltering: import("@angular/core").Signal<boolean>;
    readonly showWorkspaceList: import("@angular/core").Signal<boolean>;
    readonly filteredVisibleNodeIds: import("@angular/core").Signal<string[]>;
    addNewForm(): void;
    selectTab(tab: number | string | undefined): void;
    toggleNodeSelection(nodeId: string): void;
    deleteSelectedNodes(): void;
    addNewFolder(): void;
    openImportDialog(): void;
    setMouseInside(isInside: boolean): void;
    downloadRecoveryBackup(): void;
    resetCorruptedStorage(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FormsPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FormsPanel, "core-forms-panel", never, {}, {}, never, never, true, never>;
}
declare class ModelEditPanel {
    readonly form: import("@angular/core").Signal<NgForm>;
    protected formService: CoreFormService;
    activeForm: import("@angular/core").Signal<import("@ngx-formly/builder").EditorForm | null>;
    activeModel: import("@angular/core").Signal<Record<string, unknown>>;
    readonly isMouseOverContent: import("@angular/core").WritableSignal<boolean>;
    readonly activeModelJSON: import("@angular/core").Signal<string>;
    modifyActiveModel(newJSON: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ModelEditPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ModelEditPanel, "core-model-edit-panel", never, {}, {}, never, never, true, never>;
}
declare class StylingPanel {
    fieldChange: import("@angular/core").OutputEmitterRef<PropertyChange>;
    typeOfClassType: typeof ClassType;
    readonly activeTab: import("@angular/core").WritableSignal<"children" | "self">;
    readonly isParent: import("@angular/core").Signal<boolean>;
    readonly classNameMap: import("@angular/core").Signal<Record<string, StyleOptionCategory[]>>;
    readonly fieldGroupClassNameMap: import("@angular/core").Signal<Record<string, StyleOptionCategory[]>>;
    protected formService: CoreFormService;
    protected fieldService: CoreFieldService;
    protected stylesConfig: import("@ngx-formly/builder/ui").StylesConfig;
    protected classNamePath: string[];
    protected fieldGroupClassNamePath: string[];
    protected activeField: import("@angular/core").Signal<EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }> | null>;
    protected readonly parentField: import("@angular/core").Signal<EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }> | null>;
    classNameProperty: ChipsPropertyConfig;
    fieldGroupClassNameProperty: ChipsPropertyConfig;
    constructor();
    onFieldChanged(change: PropertyChange): void;
    protected getBreakpointCategoryEntries(classType: ClassType, activeField: EditorField, parentField: EditorField | null): Record<string, StyleOptionCategory[]>;
    protected canShowOption(option: StyleOptionConfig, breakpoint: Breakpoint, activeField: EditorField, parentField: EditorField | null): boolean;
    protected getClassValue(field: EditorField | null, classType: ClassType): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StylingPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StylingPanel, "core-styling-panel", never, {}, {
        "fieldChange": "fieldChange";
    }, never, never, true, never>;
}
interface PanelOptionConfig {
    label: string;
    value: string;
    matIcon: string;
}
declare class ValidationPanel {
    private readonly formService;
    private readonly fieldService;
    protected readonly activeField: import("@angular/core").Signal<import("@ngx-formly/builder").EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }> | null>;
    private readonly activeFieldByType;
    protected readonly config: import("@angular/core").Signal<import("@ngx-formly/builder/ui").FieldValidationConfig | undefined>;
    protected onFieldChanged(change: PropertyChange): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ValidationPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ValidationPanel, "core-validation-panel", never, {}, {}, never, never, true, never>;
}
export declare class FormlyBuilder {
    readonly hideFormTitle: import("@angular/core").InputSignal<boolean>;
    private readonly destroyRef;
    private readonly responsiveService;
    private readonly panelService;
    private readonly viewContainerRef;
    protected readonly isDesktop: import("@angular/core").Signal<boolean>;
    protected readonly isTablet: import("@angular/core").Signal<boolean>;
    protected readonly isMobile: import("@angular/core").Signal<boolean>;
    protected readonly panelSizes: import("@angular/core").WritableSignal<number[]>;
    protected readonly minSizes: import("@angular/core").WritableSignal<number[]>;
    protected readonly tabletPanelSizes: import("@angular/core").WritableSignal<number[]>;
    protected readonly tabletMinSizes: import("@angular/core").WritableSignal<number[]>;
    protected readonly mobileDrawerVisible: import("@angular/core").WritableSignal<boolean>;
    protected readonly activePanel: import("@angular/core").Signal<LHSPanelType | RHSPanelType>;
    protected readonly panelOptions: PanelOptionConfig[];
    constructor();
    openMobilePanel(panel: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FormlyBuilder, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FormlyBuilder, "formly-builder", never, {
        "hideFormTitle": {
            "alias": "hideFormTitle";
            "required": false;
            "isSignal": true;
        };
    }, {}, never, never, true, never>;
}
export declare class FormTitle {
    protected readonly forms: CoreFormService;
    protected readonly edit: import("@angular/core").WritableSignal<null | {
        formId: string;
        name: string;
    }>;
    private readonly injector;
    private readonly focusTarget;
    protected startEdit(formId: string): void;
    protected handleKeydown(event: KeyboardEvent, name: string): void;
    protected finishEdit(name: null | string, restoreFocus?: boolean): void;
    private focusAfterRender;
    static ɵfac: i0.ɵɵFactoryDeclaration<FormTitle, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FormTitle, "core-form-title", never, {}, {}, never, never, true, never>;
}
export declare const CORE_THEME: InjectionToken<WritableSignal<"dark" | "light">>;
export declare function generateTypeOptionSchema({ properties, validationConfig }: {
    properties?: PropertyConfig[];
    validationConfig?: FieldValidationConfig;
}, validationMessagesPath: string[]): Record<string, z$1.ZodType<unknown, unknown, z$1.core.$ZodTypeInternals<unknown, unknown>>>;
export declare function generateTypeOptionSchemaMap(fieldCategoryOptions: FieldCategoryOption[], validationMessagesPath: string[]): Record<string, {
    typeOption: FieldTypeOption;
    schema: Record<string, z$1.ZodType>;
}>;
export declare class ImportDialogService {
    protected readonly isOpenSrc: import("@angular/core").WritableSignal<boolean>;
    readonly isOpen: import("@angular/core").Signal<boolean>;
    protected onImportedCallback: ((formId: string) => void) | null;
    open(onImported?: (formId: string) => void): void;
    close(): void;
    notifyImported(formId: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ImportDialogService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
interface MarkdownDialogData {
    value: string;
    saveCallback: (value: string) => void;
}
export declare class MarkdownDialogService {
    protected readonly _data: import("@angular/core").WritableSignal<MarkdownDialogData | null>;
    readonly data: import("@angular/core").Signal<MarkdownDialogData | null>;
    protected readonly _isOpen: import("@angular/core").WritableSignal<boolean>;
    readonly isOpen: import("@angular/core").Signal<boolean>;
    open(data: MarkdownDialogData): void;
    close(): void;
    setValue(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MarkdownDialogService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
export declare function provideCore(styles?: StylesConfig): EnvironmentProviders;
export declare function provideCoreTheme(): EnvironmentProviders;
export declare function provideCoreConfig(libraryConfig?: LibraryConfig[], autoSave?: boolean, overrides?: Partial<Pick<CoreEditorConfig, 'autoSaveDelay' | 'editorType' | 'showSettings'>>): EnvironmentProviders;
/** Configures an embeddable Formly Builder and its isolated Formly runtime. */
export declare function provideFormlyBuilder(config?: FormlyBuilderConfig): EnvironmentProviders;
export declare const tailwindConfig: StylesConfig;
declare const defaultTypeOption: {
    name: string;
    displayName: string;
    description: string;
    materialSymbol: string;
    disableKeyGeneration: boolean;
    defaultConfig: {};
    properties: ExpressionsPropertyConfig[];
};
declare const validationMessagesPath: string[];
declare function getFormSchema(fieldCategoryOptions: FieldCategoryOption[]): z.ZodType;
export declare function createLibrary(config: Omit<LibraryConfig, 'defaultTypeOption' | 'schema'>): LibraryConfig;
/** Portable file and demo-submit controls that do not require a UI adapter. */
export declare const nativeFieldTypes: FieldTypeOption[];
export declare const nativeFieldConfig: ConfigOption;
export { type BaseEditorForm, type BasePropertyConfig, type BaseWorkspaceNode, type Breakpoint, CORE_FORM_STORE, FormlyBuilder as Core, type CoreAddFieldOption, type CoreEditorConfig, type DefaultForm, type EditorForm, type FieldCategoryOption, type FieldInfo, type FieldInfoBadge, type FieldTypeOption, type FieldTypePreset, type FieldValidationConfig, type FieldWrapperOption, type FormStoreDataKind, type FormStoreRecoveryIssue, FormStoreRecoveryRequiredError, type FormStoreService, type FormTemplate, type FormlyBuilderConfig, type GroupChildPropertyConfig, type GroupPropertyConfig, type PropertyConfig as IProperty, type PropertyConfig, type LibraryConfig, type MarkdownPropertyConfig, type PropertyChange, PropertyChangeType, type PropertyCreator, type StyleDependency, type StyleOptionCategory, type StyleOptionConfig, type StylesConfig, type ValidationRuleConfig, type ValidationRulePropertyConfig, type WorkspaceFolderNode, type WorkspaceFormNode, type WorkspaceHierarchy, type WorkspaceNode, type WorkspaceNodeType, type WorkspaceValidation, type WrappersPropertyConfig, type WrappersPropertyOption, addNodeToHierarchy, buildHierarchyFromFlatForms, createEmptyWorkspaceHierarchy, getDescendantNodeIds, isAncestorOf, modifyPropertyTarget, moveNodeInHierarchy, provideFormStore, provideLocalFormStore, recalculateNodePaths, removeNodeFromHierarchy, renameNodeInHierarchy, toggleFolderExpansion };

// types/ngx-formly-builder.d.ts
import { ConfigOption, FormlyFieldConfig, FormlyFieldProps } from "@ngx-formly/core";
import { Observable, Subject } from "rxjs";
import * as i0 from "@angular/core";
import { EnvironmentProviders, InjectionToken, Type } from "@angular/core";
/** A reusable expression copied into a field when selected. */
interface WorkspaceValidation {
    id: string;
    name: string;
    expression: string;
    message: string;
}
/**
 * Metadata about a field used by the editor to track relationships and UI state.
 */
interface FieldInfo {
    childIds: string[];
    isFieldArray?: boolean;
    /** Field name/label used for display or key generation. */
    name: string;
    /** The id of the form this field belongs to. */
    formId: string;
    /** Unique id for the field. */
    id: string;
    /** Array of ancestor ids followed by this field's id. */
    idPath: string[];
    /** True when the field can contain children. */
    isParent?: boolean;
    /** True when the field is a root-level field. */
    isRoot?: boolean;
    /** Optional UI badges to display alongside the field. */
    badges?: FieldInfoBadge[];
}
/**
 * Small descriptive badge attached to a field in the UI.
 */
interface FieldInfoBadge {
    /** Short badge text. */
    label: string;
    /** Longer description shown in a tooltip. */
    description: string;
}
type EditorField<Props = FormlyFieldProps & {
    [additionalProperties: string]: unknown;
}> = FormlyFieldConfig<Props> & {
    _info: FieldInfo;
    fieldGroup?: EditorField[];
    fieldArray?: EditorField;
    [key: string]: unknown;
};
/**
 * Basic metadata for an editor form.
 */
interface BaseEditorForm {
    /** Unique form id. */
    id: string;
    libraryId: string;
    fieldCount: number;
    /** Human friendly form name. */
    name: string;
    /** Optional parent directory/folder id. */
    parentId?: null | string;
}
/**
 * Full form representation including fields and model.
 */
interface EditorForm extends BaseEditorForm {
    /** Map of field id -> field instance. */
    fieldMap: Record<string, EditorField>;
    /** Ordered ids for root-level fields. */
    rootFieldIds: string[];
    /** Form model data object. */
    model: Record<string, unknown>;
}
/**
 * Default form package used when creating a new form from a template.
 */
interface DefaultForm {
    /** Identifier for the form. Will be generated if not set */
    id?: string;
    libraryId: string;
    fieldCount?: number;
    /** Optional parent folder id */
    parentId?: null | string;
    /** Form name. */
    name: string;
    /** Optional icon identifier (e.g. Material Symbols name) shown on template cards. */
    icon?: string;
    /** Optional short description shown on template cards. */
    description?: string;
    /** Array of field definitions for the template. */
    fields: FormlyFieldConfig[];
    /** Initial model for the template form. */
    model: Record<string, unknown>;
}
/**
 * Node types for workspace folder and form hierarchy.
 */
type WorkspaceNodeType = 'folder' | 'form';
interface BaseWorkspaceNode {
    id: string;
    name: string;
    type: WorkspaceNodeType;
    parentId: null | string;
    idPath: string[];
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}
interface WorkspaceFolderNode extends BaseWorkspaceNode {
    type: 'folder';
    childIds: string[];
    isExpanded?: boolean;
}
interface WorkspaceFormNode extends BaseWorkspaceNode {
    type: 'form';
    libraryId: string;
    fieldCount?: number;
}
type WorkspaceNode = WorkspaceFolderNode | WorkspaceFormNode;
interface WorkspaceHierarchy {
    workspaceId: string;
    rootNodeIds: string[];
    nodeMap: Record<string, WorkspaceNode>;
}
/** Whether a name can safely identify a custom expression validator. */
export declare function isValidationRuleName(name: string): boolean;
declare function isWorkspaceValidation(value: unknown): value is WorkspaceValidation;
declare function isWorkspaceValidationList(value: unknown): value is WorkspaceValidation[];
/**
 * Creates a clean, empty workspace hierarchy structure.
 */
export declare function createEmptyWorkspaceHierarchy(workspaceId: string): WorkspaceHierarchy;
/**
 * Checks if a candidate node is an ancestor of target node.
 * Used to prevent circular hierarchies (e.g. moving a folder into its own subfolder).
 */
export declare function isAncestorOf(hierarchy: WorkspaceHierarchy, potentialAncestorId: string, targetNodeId: null | string): boolean;
/**
 * Recursively collects all descendant node IDs for a given folder.
 */
export declare function getDescendantNodeIds(hierarchy: WorkspaceHierarchy, folderId: string): string[];
/**
 * Recalculates idPaths for a node and all its descendants recursively.
 */
export declare function recalculateNodePaths(nodeMap: Record<string, WorkspaceNode>, nodeId: string, parentPath?: string[]): Record<string, WorkspaceNode>;
/**
 * Adds a new node (folder or form) to the hierarchy immutably.
 */
export declare function addNodeToHierarchy(hierarchy: WorkspaceHierarchy, node: WorkspaceNode, targetIndex?: number): WorkspaceHierarchy;
/**
 * Removes a node and all of its descendants recursively from the hierarchy.
 */
export declare function removeNodeFromHierarchy(hierarchy: WorkspaceHierarchy, nodeId: string): {
    hierarchy: WorkspaceHierarchy;
    removedNodeIds: string[];
};
/**
 * Moves a node to a new parent folder (or to root) with cycle detection.
 */
export declare function moveNodeInHierarchy(hierarchy: WorkspaceHierarchy, nodeId: string, newParentId: null | string, targetIndex?: number): WorkspaceHierarchy;
/**
 * Renames a node in the hierarchy immutably.
 */
export declare function renameNodeInHierarchy(hierarchy: WorkspaceHierarchy, nodeId: string, newName: string): WorkspaceHierarchy;
/**
 * Toggles or sets the expanded state of a folder.
 */
export declare function toggleFolderExpansion(hierarchy: WorkspaceHierarchy, folderId: string, isExpanded?: boolean): WorkspaceHierarchy;
/**
 * Migrates a legacy flat array of forms into a normalized WorkspaceHierarchy.
 */
export declare function buildHierarchyFromFlatForms(workspaceId: string, forms: BaseEditorForm[]): WorkspaceHierarchy;
/**
 * Form store interface describing persistence operations.
 */
interface FormStoreService {
    /** Storage name shown in builder settings. Defaults to "Custom storage". */
    readonly label?: string;
    /** Add a new form to storage. */
    addForm$(editorType: string, form: DefaultForm): Observable<void>;
    /** Update an existing form in storage. */
    updateForm$(editorType: string, form: DefaultForm): Observable<void>;
    /** Remove a form by id. */
    removeForm$(editorType: string, formId: string): Observable<void>;
    /** Retrieve a stored form by id. */
    getForm$(editorType: string, formId: string): Observable<DefaultForm | undefined>;
    /** List available forms for an editor. */
    getFormList$(editorType: string): Observable<BaseEditorForm[]>;
    /** Retrieve the full workspace hierarchy structure. */
    getHierarchy$(editorType: string): Observable<WorkspaceHierarchy>;
    /** Save the full workspace hierarchy structure. */
    saveHierarchy$(editorType: string, hierarchy: WorkspaceHierarchy): Observable<void>;
    /** Catalog support requires both methods. Rules are shared within the editor namespace. */
    getValidations$?(editorType: string): Observable<WorkspaceValidation[]>;
    saveValidations$?(editorType: string, validations: WorkspaceValidation[]): Observable<void>;
    /** Report local data that could not be read without discarding the original value. */
    getRecoveryIssues$?(editorType: string): Observable<readonly FormStoreRecoveryIssue[]>;
    /** Explicitly remove corrupted local data for an editor namespace. */
    resetCorruptedStorage$?(editorType: string, kind?: FormStoreDataKind): Observable<void>;
}
type FormStoreDataKind = 'forms' | 'hierarchy' | 'validations';
interface FormStoreRecoveryIssue {
    editorType: string;
    kind: FormStoreDataKind;
    reason: 'invalid-json' | 'invalid-shape';
    storageKey: string;
    rawValue: string;
    /** Additional stored values removed when this issue is reset, included in recovery backups. */
    relatedEntries?: readonly {
        storageKey: string;
        rawValue: string;
    }[];
}
export declare class FormStoreRecoveryRequiredError extends Error {
    readonly issues: readonly FormStoreRecoveryIssue[];
    constructor(issues: readonly FormStoreRecoveryIssue[]);
}
export declare const CORE_FORM_STORE: InjectionToken<FormStoreService>;
export declare class LocalFormStoreService implements FormStoreService {
    readonly label = "Browser local storage";
    readonly storageKey = "formly-studio-forms";
    readonly hierarchyStorageKey = "formly-studio-hierarchy";
    readonly validationsStorageKey = "formly-studio-validations";
    private readonly recoveryIssues;
    addForm$(editorType: string, newForm: DefaultForm): Observable<undefined>;
    updateForm$(editorType: string, newForm: DefaultForm): Observable<undefined>;
    removeForm$(editorType: string, formId: string): Observable<undefined>;
    getFormList$(editorType: string): Observable<BaseEditorForm[]>;
    getForm$(editorType: string, formId: string): Observable<DefaultForm | undefined>;
    getHierarchy$(editorType: string): Observable<WorkspaceHierarchy>;
    saveHierarchy$(editorType: string, hierarchy: WorkspaceHierarchy): Observable<void>;
    getRecoveryIssues$(editorType: string): Observable<readonly FormStoreRecoveryIssue[]>;
    getValidations$(editorType: string): Observable<WorkspaceValidation[]>;
    saveValidations$(editorType: string, validations: WorkspaceValidation[]): Observable<void>;
    private readValidations;
    resetCorruptedStorage$(editorType: string, kind?: FormStoreDataKind): Observable<void>;
    protected getHierarchySync(editorType: string): WorkspaceHierarchy;
    protected storeHierarchy(editorType: string, hierarchy: WorkspaceHierarchy): void;
    protected getFormMap(editorType: string): Record<string, DefaultForm>;
    protected storeFormMap(editorType: string, formMap: Record<string, DefaultForm>): void;
    private getRecoveryIssuesSubject;
    private getRecoveryError;
    private setRecoveryIssue;
    private clearRecoveryIssue;
    private isFormMap;
    private isWorkspaceHierarchy;
    private isWorkspaceNode;
    private isRecord;
    static ɵfac: i0.ɵɵFactoryDeclaration<LocalFormStoreService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
/** Field metadata used by document operations, without rendering components. */
interface EngineFieldType {
    name: string;
    displayName: string;
    defaultConfig: FormlyFieldConfig;
    isParent?: boolean;
    isFieldArray?: boolean;
    disableKeyGeneration?: boolean;
    keyGenerationPrefix?: string;
}
interface EngineFieldPreset {
    id?: string;
    displayName?: string;
    isRemovable?: boolean;
    typeOption?: EngineFieldType;
    field: FormlyFieldConfig;
}
/** Libraries available to a headless editor. Runtime registration is the host's responsibility. */
interface EngineLibrary {
    id: string;
    fieldTypes: EngineFieldType[];
    defaultField?: FormlyFieldConfig;
}
interface BuilderEngineConfig {
    editorType: string;
    libraries: EngineLibrary[];
    /** Defaults to true. */
    autoSave?: boolean;
    autoSaveDelay?: number;
    formStore?: Type<FormStoreService>;
}
export declare const BUILDER_ENGINE_CONFIG: InjectionToken<BuilderEngineConfig>;
/** A failed selection leaves the current document and save status unchanged. */
interface FormLoadError {
    formId: string;
    reason: 'invalid-form' | 'missing-library' | 'not-found' | 'recovery-required' | 'store-error';
    libraryId?: string;
    cause?: unknown;
}
interface PersistenceError {
    action: string;
    cause: unknown;
    failedFormIds?: string[];
}
export declare enum PropertyChangeType {
    KEY = 0,
    VALUE = 1,
    CLEAR = 2
}
interface PropertyChange {
    type: PropertyChangeType;
    path: string[];
    newPath?: string[];
    value?: unknown;
}
export declare const modifyPropertyTarget: <T extends Record<string, unknown>>(target: T, { type, ...change }: PropertyChange) => T;
type FieldDropPosition = 'bottom' | 'center' | 'left' | 'right' | 'top';
export declare function isLayoutRow(field: FormlyFieldConfig | undefined): boolean;
/** Only discard empty generated rows; a remaining field keeps its full row and original styles. */
declare function removeEmptyRows(form: EditorForm): void;
declare function canDropField(form: EditorForm, sourceId: string | undefined, targetId: string, position: FieldDropPosition): boolean;
/** Mutates a draft after canDropField has validated the destination. */
declare function placeField(form: EditorForm, sourceId: string, targetId: string, position: FieldDropPosition, rowId: string): void;
export declare class BuilderEngineService {
    protected readonly editorConfig: BuilderEngineConfig;
    protected readonly formStoreService: FormStoreService;
    private readonly destroyRef;
    private pendingFormId;
    private readonly cancelLoad$;
    private loadVersion;
    private activeVersion;
    private readonly queuedSaves;
    private readonly operations$;
    private readonly loadingFormIdSrc;
    private readonly formLoadErrorSrc;
    private readonly persistenceErrorSrc;
    readonly loadingFormId: import("@angular/core").Signal<null | string>;
    readonly formLoadError: import("@angular/core").Signal<FormLoadError | null>;
    readonly persistenceError: import("@angular/core").Signal<PersistenceError | null>;
    private readonly autosaveTrigger$;
    private readonly autosaveEnabled;
    private readonly autosaveDelay;
    readonly saveActiveFormTrigger$: Subject<void>;
    readonly saveStatusSrc: import("@angular/core").WritableSignal<"dirty" | "error" | "saved" | "saving">;
    readonly saveStatus: import("@angular/core").Signal<"dirty" | "error" | "saved" | "saving">;
    protected readonly storageRecoveryIssuesSrc: import("@angular/core").WritableSignal<readonly FormStoreRecoveryIssue[]>;
    readonly storageRecoveryIssues: import("@angular/core").Signal<readonly FormStoreRecoveryIssue[]>;
    readonly hasStorageRecoveryIssues: import("@angular/core").Signal<boolean>;
    readonly hasFormStorageRecoveryIssue: import("@angular/core").Signal<boolean>;
    readonly validationStorageAvailable: boolean;
    private readonly validationsSrc;
    readonly validations: import("@angular/core").Signal<WorkspaceValidation[]>;
    private readonly validationsLoadingSrc;
    readonly validationsLoading: import("@angular/core").Signal<boolean>;
    private readonly validationsLoadErrorSrc;
    readonly validationsLoadError: import("@angular/core").Signal<null | string>;
    readonly validationRecoveryIssues: import("@angular/core").Signal<FormStoreRecoveryIssue[]>;
    protected readonly formListSrc: import("@angular/core").WritableSignal<BaseEditorForm[]>;
    protected readonly hierarchySrc: import("@angular/core").WritableSignal<WorkspaceHierarchy>;
    protected readonly activeFieldIdSrc: import("@angular/core").WritableSignal<null | string>;
    protected readonly activeFormSrc: import("@angular/core").WritableSignal<EditorForm | null>;
    protected readonly activeFieldIdByFormSrc: import("@angular/core").WritableSignal<Record<string, null | string>>;
    readonly formList: import("@angular/core").Signal<BaseEditorForm[]>;
    readonly hierarchy: import("@angular/core").Signal<WorkspaceHierarchy>;
    readonly hierarchyRootNodeIds: import("@angular/core").Signal<string[]>;
    readonly hierarchyNodeMap: import("@angular/core").Signal<Record<string, import("@ngx-formly/builder").WorkspaceNode>>;
    readonly activeFieldId: import("@angular/core").Signal<null | string>;
    readonly activeForm: import("@angular/core").Signal<EditorForm | null>;
    readonly activeFormId: import("@angular/core").Signal<string | undefined>;
    readonly activeFormName: import("@angular/core").Signal<string | undefined>;
    readonly activeRootFieldIds: import("@angular/core").Signal<string[]>;
    readonly activeFieldMap: import("@angular/core").Signal<Record<string, EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }>>>;
    readonly activeFieldCount: import("@angular/core").Signal<number>;
    readonly activeField: import("@angular/core").Signal<EditorField<import("@ngx-formly/core").FormlyFieldProps & {
        [additionalProperties: string]: unknown;
    }> | null>;
    readonly activeFormFieldsRaw: import("@angular/core").Signal<EditorField[]>;
    readonly activeModel: import("@angular/core").Signal<Record<string, unknown>>;
    readonly activeLibraryId: import("@angular/core").Signal<null | string>;
    readonly formSelected$: Subject<EditorForm | null>;
    readonly activeFormFields: import("@angular/core").Signal<EditorField[]>;
    readonly activePreviewFormFields: import("@angular/core").Signal<EditorField[]>;
    readonly activeFormFieldsJSON: import("@angular/core").Signal<string>;
    /** Create one mutable preview per renderer; unchanged fields retain their identities. */
    createPreviewFields(): import("@angular/core").Signal<EditorField[]>;
    constructor(config: BuilderEngineConfig, store: FormStoreService);
    private enqueue$;
    private snapshot$;
    private refreshWorkspace$;
    loadValidations(): void;
    private readValidations$;
    saveValidation$(draft: Omit<WorkspaceValidation, 'id'>, id?: string): Observable<void>;
    deleteValidation$(id: string): Observable<void>;
    private mutateValidations$;
    resetValidations$(): Observable<void>;
    private runMutation;
    private requestSave;
    protected markFormDirty(): void;
    protected refreshHierarchy(): void;
    resetCorruptedStorage(): void;
    getStorageRecoveryBackup(kind?: FormStoreDataKind): string;
    setActiveField(fieldId: null | string): void;
    setActiveFormName(newName: string): void;
    setWorkspaceNodeName(nodeId: string, newName: string): void;
    private cancelLoad;
    setActiveForm(formId: null | string): void;
    saveActiveForm(): void;
    addForm$(name: string, fields: FormlyFieldConfig[] | undefined, model: Record<string, unknown>, libraryId: string, setActive?: boolean, parentId?: null | string): Observable<void>;
    private clearDeletedSelection;
    removeForm(formId: string): void;
    createFolder(name: string, parentId?: null | string): string | undefined;
    deleteWorkspaceNode(nodeId: string): void;
    moveWorkspaceNode(nodeId: string, targetFolderId: null | string, targetIndex?: number): void;
    renameWorkspaceNode(nodeId: string, newName: string): void;
    toggleFolderExpansion(folderId: string, isExpanded?: boolean): void;
    private isStorageMutationBlocked;
    private handlePersistenceError;
    modifyActiveField(change: PropertyChange): void;
    setActiveModel(newModel: Record<string, unknown>): void;
    modifyActiveModel(newModelJSON: string): void;
    getField(fieldId: string): EditorField | undefined;
    private getTypeOptions;
    private getDefaultField;
    protected insertId(id: string, arr: string[], index: number | undefined): string[];
    buildField(fieldId: string, fieldMap: Record<string, EditorField>): EditorField;
    cleanField(field: EditorField): void;
    convertFromRawForm({ id, name, libraryId, fields, model, parentId }: DefaultForm): EditorForm;
    convertToRawForm({ id, libraryId, name, fieldMap, rootFieldIds, model, parentId }: EditorForm): DefaultForm;
    getFieldIndex(fieldId: string): number;
    canDropField(sourceId: string | undefined, targetId: string, position: FieldDropPosition): boolean;
    /** Adds or moves a field and updates its row in one document change. */
    dropField(targetId: string, position: FieldDropPosition, source: {
        fieldId: string;
    } | {
        fieldType: string;
        preset?: EngineFieldPreset;
    }): void;
    addField(fieldType: string, parentId?: string, index?: number, preset?: EngineFieldPreset): void;
    removeField(fieldId: string): void;
    moveField(fieldId: string, fromIndex: number, toIndex: number | undefined, toParentId?: string | undefined): void;
    replaceField(fieldType: string, fieldId: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BuilderEngineService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
type StatefulField = FormlyFieldConfig & {
    _info?: Pick<FieldInfo, 'id'>;
};
export declare class BuilderFieldStateService {
    protected readonly formService: BuilderEngineService;
    constructor(formService?: BuilderEngineService);
    private readonly state;
    getState<T>(field: StatefulField): T | undefined;
    setState<T>(field: StatefulField, state: T): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BuilderFieldStateService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
/** Provide an isolated editor engine without configuring a UI shell or a Formly runtime. */
export declare function provideBuilderEngine(config: BuilderEngineConfig): EnvironmentProviders;
export declare function provideFormStore(service: Type<FormStoreService>): EnvironmentProviders;
export declare function provideLocalFormStore(): EnvironmentProviders;
export declare function generateFormId(): string;
export declare function generateFieldId(type: string | undefined): string;
export declare function clearFieldModelValue(fieldId: string, fieldMap: Record<string, EditorField>, model: Record<string, unknown>): void;
/**
 * Converts a FormlyFieldConfig to an IEditorFormlyField, populating _info and generating ids.
 */
export declare function convertField(sourceField: FormlyFieldConfig, fieldId: string, formId: string, parentIdPath: string[] | undefined, fieldMap: Record<string, EditorField>, typeOptions: EngineFieldType[], getDefaultField: (type: string) => FormlyFieldConfig): EditorField;
/** Recheck expression validators when another field changes their model. */
export declare function withValidationExpressions(): ConfigOption;
export type { BaseEditorForm, BaseWorkspaceNode, BuilderEngineConfig, DefaultForm, EditorField, EditorForm, EngineFieldPreset, EngineFieldType, EngineLibrary, FieldDropPosition, FieldInfo, FieldInfoBadge, FormLoadError, FormStoreDataKind, FormStoreRecoveryIssue, FormStoreService, PersistenceError, PropertyChange, WorkspaceFolderNode, WorkspaceFormNode, WorkspaceHierarchy, WorkspaceNode, WorkspaceNodeType, WorkspaceValidation };
```
