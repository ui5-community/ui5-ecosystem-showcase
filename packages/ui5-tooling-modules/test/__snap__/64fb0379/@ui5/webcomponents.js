/*!
 * ${copyright}
 */
sap.ui.define(
  ["../webcomponents", "sap/ui/base/DataType", "../@ui5/webcomponents-base"],
  function (WebCPackage, DataType) {
    "use strict";
    const { registerEnum } = DataType;

    // re-export package object
    const pkg = Object.assign({}, WebCPackage);

    // export the UI5 metadata along with the package
    pkg["_ui5metadata"] = {
      name: "@ui5/webcomponents",
      npmPackage: "@ui5/webcomponents",
      version: "2.28.1",
      dependencies: ["sap.ui.core"],
      types: [
        "ui5.webcomponents.dist.types.AvatarColorScheme",
        "ui5.webcomponents.dist.types.AvatarGroupType",
        "ui5.webcomponents.dist.types.AvatarMode",
        "ui5.webcomponents.dist.types.AvatarShape",
        "ui5.webcomponents.dist.types.AvatarSize",
        "ui5.webcomponents.dist.types.BackgroundDesign",
        "ui5.webcomponents.dist.types.BarAccessibleRole",
        "ui5.webcomponents.dist.types.BarDesign",
        "ui5.webcomponents.dist.types.BorderDesign",
        "ui5.webcomponents.dist.types.BreadcrumbsDesign",
        "ui5.webcomponents.dist.types.BreadcrumbsSeparator",
        "ui5.webcomponents.dist.types.BusyIndicatorSize",
        "ui5.webcomponents.dist.types.BusyIndicatorTextPlacement",
        "ui5.webcomponents.dist.types.ButtonAccessibleRole",
        "ui5.webcomponents.dist.types.ButtonBadgeDesign",
        "ui5.webcomponents.dist.types.ButtonDesign",
        "ui5.webcomponents.dist.types.ButtonType",
        "ui5.webcomponents.dist.types.CalendarLegendItemType",
        "ui5.webcomponents.dist.types.CalendarSelectionMode",
        "ui5.webcomponents.dist.types.CalendarWeekNumbering",
        "ui5.webcomponents.dist.types.CarouselArrowsPlacement",
        "ui5.webcomponents.dist.types.CarouselPageIndicatorType",
        "ui5.webcomponents.dist.types.ComboBoxFilter",
        "ui5.webcomponents.dist.types.ExpandableTextOverflowMode",
        "ui5.webcomponents.dist.types.FormAccessibleMode",
        "ui5.webcomponents.dist.types.FormItemSpacing",
        "ui5.webcomponents.dist.types.Highlight",
        "ui5.webcomponents.dist.types.IconDesign",
        "ui5.webcomponents.dist.types.IconMode",
        "ui5.webcomponents.dist.types.InputSuggestionsFilter",
        "ui5.webcomponents.dist.types.InputType",
        "ui5.webcomponents.dist.types.InteractiveAreaSize",
        "ui5.webcomponents.dist.types.LinkAccessibleRole",
        "ui5.webcomponents.dist.types.LinkDesign",
        "ui5.webcomponents.dist.types.ListAccessibleRole",
        "ui5.webcomponents.dist.types.ListGrowingMode",
        "ui5.webcomponents.dist.types.ListItemAccessibleRole",
        "ui5.webcomponents.dist.types.ListItemType",
        "ui5.webcomponents.dist.types.ListSelectionMode",
        "ui5.webcomponents.dist.types.ListSeparator",
        "ui5.webcomponents.dist.types.MenuItemGroupCheckMode",
        "ui5.webcomponents.dist.types.MessageStripDesign",
        "ui5.webcomponents.dist.types.NotificationListGrowingMode",
        "ui5.webcomponents.dist.types.OverflowMode",
        "ui5.webcomponents.dist.types.PanelAccessibleRole",
        "ui5.webcomponents.dist.types.PopoverHorizontalAlign",
        "ui5.webcomponents.dist.types.PopoverPlacement",
        "ui5.webcomponents.dist.types.PopoverVerticalAlign",
        "ui5.webcomponents.dist.types.PopupAccessibleRole",
        "ui5.webcomponents.dist.types.Priority",
        "ui5.webcomponents.dist.types.RatingIndicatorSize",
        "ui5.webcomponents.dist.types.SegmentedButtonSelectionMode",
        "ui5.webcomponents.dist.types.SelectTextSeparator",
        "ui5.webcomponents.dist.types.SemanticColor",
        "ui5.webcomponents.dist.types.SwitchDesign",
        "ui5.webcomponents.dist.types.TabLayout",
        "ui5.webcomponents.dist.types.TableCellHorizontalAlign",
        "ui5.webcomponents.dist.types.TableGrowingMode",
        "ui5.webcomponents.dist.types.TableOverflowMode",
        "ui5.webcomponents.dist.types.TableSelectionBehavior",
        "ui5.webcomponents.dist.types.TableSelectionMode",
        "ui5.webcomponents.dist.types.TableSelectionMultiHeaderSelector",
        "ui5.webcomponents.dist.types.TagDesign",
        "ui5.webcomponents.dist.types.TagSize",
        "ui5.webcomponents.dist.types.TextAreaCounterMode",
        "ui5.webcomponents.dist.types.TextEmptyIndicatorMode",
        "ui5.webcomponents.dist.types.TitleLevel",
        "ui5.webcomponents.dist.types.ToastPlacement",
        "ui5.webcomponents.dist.types.ToolbarAlign",
        "ui5.webcomponents.dist.types.ToolbarDesign",
        "ui5.webcomponents.dist.types.ToolbarItemOverflowBehavior",
        "ui5.webcomponents.dist.types.WrappingType"
      ],
      interfaces: [
        "ui5.webcomponents.dist.AvatarGroup.IAvatarGroupItem",
        "ui5.webcomponents.dist.Button.IButton",
        "ui5.webcomponents.dist.Calendar.ICalendarSelectedDates",
        "ui5.webcomponents.dist.ColorPalette.IColorPaletteItem",
        "ui5.webcomponents.dist.ComboBox.IComboBoxItem",
        "ui5.webcomponents.dist.DynamicDateRange.IDynamicDateRangeOption",
        "ui5.webcomponents.dist.Form.IFormItem",
        "ui5.webcomponents.dist.Icon.IIcon",
        "ui5.webcomponents.dist.Input.IInputSuggestionItem",
        "ui5.webcomponents.dist.Menu.IMenuItem",
        "ui5.webcomponents.dist.MultiComboBox.IMultiComboBoxItem",
        "ui5.webcomponents.dist.SegmentedButton.ISegmentedButtonItem",
        "ui5.webcomponents.dist.Select.IOption",
        "ui5.webcomponents.dist.Select.IOptionGroup",
        "ui5.webcomponents.dist.TabContainer.ITab",
        "ui5.webcomponents.dist.Table.ITableFeature",
        "ui5.webcomponents.dist.Table.ITableGrowing",
        "ui5.webcomponents.dist.ToolbarItem.IToolbarItemContent"
      ],
      controls: [
        "ui5.webcomponents.dist.Avatar",
        "ui5.webcomponents.dist.AvatarBadge",
        "ui5.webcomponents.dist.AvatarGroup",
        "ui5.webcomponents.dist.Bar",
        "ui5.webcomponents.dist.Breadcrumbs",
        "ui5.webcomponents.dist.BreadcrumbsItem",
        "ui5.webcomponents.dist.BusyIndicator",
        "ui5.webcomponents.dist.Button",
        "ui5.webcomponents.dist.ButtonBadge",
        "ui5.webcomponents.dist.Calendar",
        "ui5.webcomponents.dist.CalendarDate",
        "ui5.webcomponents.dist.CalendarDateRange",
        "ui5.webcomponents.dist.CalendarLegend",
        "ui5.webcomponents.dist.CalendarLegendItem",
        "ui5.webcomponents.dist.Card",
        "ui5.webcomponents.dist.CardHeader",
        "ui5.webcomponents.dist.Carousel",
        "ui5.webcomponents.dist.CheckBox",
        "ui5.webcomponents.dist.ColorPalette",
        "ui5.webcomponents.dist.ColorPaletteItem",
        "ui5.webcomponents.dist.ColorPalettePopover",
        "ui5.webcomponents.dist.ColorPicker",
        "ui5.webcomponents.dist.ComboBox",
        "ui5.webcomponents.dist.ComboBoxItem",
        "ui5.webcomponents.dist.ComboBoxItemCustom",
        "ui5.webcomponents.dist.ComboBoxItemGroup",
        "ui5.webcomponents.dist.DatePicker",
        "ui5.webcomponents.dist.DateRangePicker",
        "ui5.webcomponents.dist.DateTimeInput",
        "ui5.webcomponents.dist.DateTimePicker",
        "ui5.webcomponents.dist.DayPicker",
        "ui5.webcomponents.dist.Dialog",
        "ui5.webcomponents.dist.DropIndicator",
        "ui5.webcomponents.dist.DynamicDateRange",
        "ui5.webcomponents.dist.ExpandableText",
        "ui5.webcomponents.dist.FileUploader",
        "ui5.webcomponents.dist.Form",
        "ui5.webcomponents.dist.FormGroup",
        "ui5.webcomponents.dist.FormItem",
        "ui5.webcomponents.dist.Icon",
        "ui5.webcomponents.dist.Input",
        "ui5.webcomponents.dist.InputIcon",
        "ui5.webcomponents.dist.Label",
        "ui5.webcomponents.dist.Link",
        "ui5.webcomponents.dist.List",
        "ui5.webcomponents.dist.ListItemCustom",
        "ui5.webcomponents.dist.ListItemGroup",
        "ui5.webcomponents.dist.ListItemGroupHeader",
        "ui5.webcomponents.dist.ListItemStandard",
        "ui5.webcomponents.dist.Menu",
        "ui5.webcomponents.dist.MenuItem",
        "ui5.webcomponents.dist.MenuItemGroup",
        "ui5.webcomponents.dist.MenuSeparator",
        "ui5.webcomponents.dist.MessageStrip",
        "ui5.webcomponents.dist.MonthPicker",
        "ui5.webcomponents.dist.MultiComboBox",
        "ui5.webcomponents.dist.MultiComboBoxItem",
        "ui5.webcomponents.dist.MultiComboBoxItemCustom",
        "ui5.webcomponents.dist.MultiComboBoxItemGroup",
        "ui5.webcomponents.dist.MultiInput",
        "ui5.webcomponents.dist.NumericInput",
        "ui5.webcomponents.dist.Option",
        "ui5.webcomponents.dist.OptionCustom",
        "ui5.webcomponents.dist.OptionGroup",
        "ui5.webcomponents.dist.Panel",
        "ui5.webcomponents.dist.Popover",
        "ui5.webcomponents.dist.ProgressIndicator",
        "ui5.webcomponents.dist.RadioButton",
        "ui5.webcomponents.dist.RangeSlider",
        "ui5.webcomponents.dist.RatingIndicator",
        "ui5.webcomponents.dist.ResponsivePopover",
        "ui5.webcomponents.dist.SegmentedButton",
        "ui5.webcomponents.dist.SegmentedButtonItem",
        "ui5.webcomponents.dist.Select",
        "ui5.webcomponents.dist.Slider",
        "ui5.webcomponents.dist.SliderHandle",
        "ui5.webcomponents.dist.SliderTooltip",
        "ui5.webcomponents.dist.SpecialCalendarDate",
        "ui5.webcomponents.dist.SplitButton",
        "ui5.webcomponents.dist.StepInput",
        "ui5.webcomponents.dist.SuggestionItem",
        "ui5.webcomponents.dist.SuggestionItemCustom",
        "ui5.webcomponents.dist.SuggestionItemGroup",
        "ui5.webcomponents.dist.SuggestionListItem",
        "ui5.webcomponents.dist.Switch",
        "ui5.webcomponents.dist.Tab",
        "ui5.webcomponents.dist.TabContainer",
        "ui5.webcomponents.dist.TabSeparator",
        "ui5.webcomponents.dist.Table",
        "ui5.webcomponents.dist.TableCell",
        "ui5.webcomponents.dist.TableGroupRow",
        "ui5.webcomponents.dist.TableGrowing",
        "ui5.webcomponents.dist.TableHeaderCell",
        "ui5.webcomponents.dist.TableHeaderCellActionAI",
        "ui5.webcomponents.dist.TableHeaderRow",
        "ui5.webcomponents.dist.TableRow",
        "ui5.webcomponents.dist.TableRowAction",
        "ui5.webcomponents.dist.TableRowActionNavigation",
        "ui5.webcomponents.dist.TableSelection",
        "ui5.webcomponents.dist.TableSelectionMulti",
        "ui5.webcomponents.dist.TableSelectionSingle",
        "ui5.webcomponents.dist.TableVirtualizer",
        "ui5.webcomponents.dist.Tag",
        "ui5.webcomponents.dist.Text",
        "ui5.webcomponents.dist.TextArea",
        "ui5.webcomponents.dist.TimePicker",
        "ui5.webcomponents.dist.TimePickerClock",
        "ui5.webcomponents.dist.TimeSelectionClocks",
        "ui5.webcomponents.dist.TimeSelectionInputs",
        "ui5.webcomponents.dist.Title",
        "ui5.webcomponents.dist.Toast",
        "ui5.webcomponents.dist.ToggleButton",
        "ui5.webcomponents.dist.ToggleSpinButton",
        "ui5.webcomponents.dist.Token",
        "ui5.webcomponents.dist.Tokenizer",
        "ui5.webcomponents.dist.Toolbar",
        "ui5.webcomponents.dist.ToolbarButton",
        "ui5.webcomponents.dist.ToolbarItem",
        "ui5.webcomponents.dist.ToolbarSelect",
        "ui5.webcomponents.dist.ToolbarSelectOption",
        "ui5.webcomponents.dist.ToolbarSeparator",
        "ui5.webcomponents.dist.ToolbarSpacer",
        "ui5.webcomponents.dist.Tree",
        "ui5.webcomponents.dist.TreeItem",
        "ui5.webcomponents.dist.TreeItemCustom",
        "ui5.webcomponents.dist.YearPicker",
        "ui5.webcomponents.dist.YearRangePicker"
      ],
      elements: [],
      rootPath: "../"
    };

    // Enums
    pkg.dist = Object.assign({}, pkg.dist);
    pkg.dist.types = Object.assign({}, pkg.dist.types);
    /**
     * Different types of AvatarColorScheme.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.AvatarColorScheme
     * @ui5-module-override @ui5/webcomponents dist.types.AvatarColorScheme
     * @private
     */
    pkg.dist.types.AvatarColorScheme = {
      /**
       * Accent1
       *
       * @private
       */
      Accent1: "Accent1",
      /**
       * Accent10
       *
       * @private
       */
      Accent10: "Accent10",
      /**
       * Accent2
       *
       * @private
       */
      Accent2: "Accent2",
      /**
       * Accent3
       *
       * @private
       */
      Accent3: "Accent3",
      /**
       * Accent4
       *
       * @private
       */
      Accent4: "Accent4",
      /**
       * Accent5
       *
       * @private
       */
      Accent5: "Accent5",
      /**
       * Accent6
       *
       * @private
       */
      Accent6: "Accent6",
      /**
       * Accent7
       *
       * @private
       */
      Accent7: "Accent7",
      /**
       * Accent8
       *
       * @private
       */
      Accent8: "Accent8",
      /**
       * Accent9
       *
       * @private
       */
      Accent9: "Accent9",
      /**
       * Auto
       *
       * @private
       */
      Auto: "Auto",
      /**
       * Placeholder
       *
       * @private
       */
      Placeholder: "Placeholder",
      /**
       * Transparent
       *
       * @private
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.AvatarColorScheme",
      pkg.dist.types.AvatarColorScheme
    );
    /**
     * Different types of AvatarGroupType.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.AvatarGroupType
     * @ui5-module-override @ui5/webcomponents dist.types.AvatarGroupType
     * @private
     */
    pkg.dist.types.AvatarGroupType = {
      /**
       * The avatars are displayed as partially overlapped on top of each other and the entire group has one click or tap area.
       *
       * @private
       */
      Group: "Group",
      /**
       * The avatars are displayed side-by-side and each avatar has its own click or tap area.
       *
       * @private
       */
      Individual: "Individual"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.AvatarGroupType",
      pkg.dist.types.AvatarGroupType
    );
    /**
     * Different Avatar modes.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.AvatarMode
     * @ui5-module-override @ui5/webcomponents dist.types.AvatarMode
     * @private
     */
    pkg.dist.types.AvatarMode = {
      /**
       * Decorative mode.
       * Configures the component to internally render role&#x3D;&quot;presentation&quot; and aria-hidden&#x3D;&quot;true&quot;,
       * making it purely decorative without semantic content or interactivity.
       *
       * @private
       */
      Decorative: "Decorative",
      /**
       * Image mode (by default).
       * Configures the component to internally render role&#x3D;&quot;img&quot;.
       *
       * @private
       */
      Image: "Image",
      /**
       * Interactive mode.
       * Configures the component to internally render role&#x3D;&quot;button&quot;.
       * This mode also supports focus and enables keyboard interaction.
       *
       * @private
       */
      Interactive: "Interactive"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.AvatarMode",
      pkg.dist.types.AvatarMode
    );
    /**
     * Different types of AvatarShape.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.AvatarShape
     * @ui5-module-override @ui5/webcomponents dist.types.AvatarShape
     * @private
     */
    pkg.dist.types.AvatarShape = {
      /**
       * Circular shape.
       *
       * @private
       */
      Circle: "Circle",
      /**
       * Square shape.
       *
       * @private
       */
      Square: "Square"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.AvatarShape",
      pkg.dist.types.AvatarShape
    );
    /**
     * Different types of AvatarSize.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.AvatarSize
     * @ui5-module-override @ui5/webcomponents dist.types.AvatarSize
     * @private
     */
    pkg.dist.types.AvatarSize = {
      /**
       * component size - 5rem
       * font size - 2.5rem
       *
       * @private
       */
      L: "L",
      /**
       * component size - 4rem
       * font size - 2rem
       *
       * @private
       */
      M: "M",
      /**
       * component size - 3rem
       * font size - 1.5rem
       *
       * @private
       */
      S: "S",
      /**
       * component size - 7rem
       * font size - 3rem
       *
       * @private
       */
      XL: "XL",
      /**
       * component size - 2rem
       * font size - 1rem
       *
       * @private
       */
      XS: "XS"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.AvatarSize",
      pkg.dist.types.AvatarSize
    );
    /**
     * Defines background designs.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.BackgroundDesign
     * @ui5-module-override @ui5/webcomponents dist.types.BackgroundDesign
     * @private
     */
    pkg.dist.types.BackgroundDesign = {
      /**
       * A solid background color dependent on the theme.
       *
       * @private
       */
      Solid: "Solid",
      /**
       * A translucent background depending on the opacity value of the theme.
       *
       * @private
       */
      Translucent: "Translucent",
      /**
       * Transparent background.
       *
       * @private
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.BackgroundDesign",
      pkg.dist.types.BackgroundDesign
    );
    /**
     * Bar accessible roles.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.BarAccessibleRole
     * @ui5-module-override @ui5/webcomponents dist.types.BarAccessibleRole
     * @private
     */
    pkg.dist.types.BarAccessibleRole = {
      /**
       * Represents the ARIA role &quot;none&quot;.
       *
       * @private
       */
      None: "None",
      /**
       * Represents the ARIA role &quot;toolbar&quot;.
       *
       * @private
       */
      Toolbar: "Toolbar"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.BarAccessibleRole",
      pkg.dist.types.BarAccessibleRole
    );
    /**
     * Different types of Bar design
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.BarDesign
     * @ui5-module-override @ui5/webcomponents dist.types.BarDesign
     * @private
     */
    pkg.dist.types.BarDesign = {
      /**
       * Floating Footer type - there is visible border on all sides
       *
       * @private
       */
      FloatingFooter: "FloatingFooter",
      /**
       * Footer type
       *
       * @private
       */
      Footer: "Footer",
      /**
       * Default type
       *
       * @private
       */
      Header: "Header",
      /**
       * Subheader type
       *
       * @private
       */
      Subheader: "Subheader"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.BarDesign",
      pkg.dist.types.BarDesign
    );
    /**
     * Defines border designs.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.BorderDesign
     * @ui5-module-override @ui5/webcomponents dist.types.BorderDesign
     * @private
     */
    pkg.dist.types.BorderDesign = {
      /**
       * Specifies no border.
       *
       * @private
       */
      None: "None",
      /**
       * A solid border color dependent on the theme.
       *
       * @private
       */
      Solid: "Solid"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.BorderDesign",
      pkg.dist.types.BorderDesign
    );
    /**
     * Different  Breadcrumbs designs.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.BreadcrumbsDesign
     * @ui5-module-override @ui5/webcomponents dist.types.BreadcrumbsDesign
     * @private
     */
    pkg.dist.types.BreadcrumbsDesign = {
      /**
       * All items are displayed as links.
       *
       * @private
       */
      NoCurrentPage: "NoCurrentPage",
      /**
       * Shows the current page as the last item in the trail.
       * The last item contains only plain text and is not a link.
       *
       * @private
       */
      Standard: "Standard"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.BreadcrumbsDesign",
      pkg.dist.types.BreadcrumbsDesign
    );
    /**
     * Different Breadcrumbs separators.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.BreadcrumbsSeparator
     * @ui5-module-override @ui5/webcomponents dist.types.BreadcrumbsSeparator
     * @private
     */
    pkg.dist.types.BreadcrumbsSeparator = {
      /**
       * The separator appears as &quot;\&quot;.
       *
       * @private
       */
      BackSlash: "BackSlash",
      /**
       * The separator appears as &quot;\\&quot;.
       *
       * @private
       */
      DoubleBackSlash: "DoubleBackSlash",
      /**
       * The separator appears as &quot;&gt;&gt;&quot;.
       *
       * @private
       */
      DoubleGreaterThan: "DoubleGreaterThan",
      /**
       * The separator appears as &quot;//&quot; .
       *
       * @private
       */
      DoubleSlash: "DoubleSlash",
      /**
       * The separator appears as &quot;&gt;&quot;.
       *
       * @private
       */
      GreaterThan: "GreaterThan",
      /**
       * The separator appears as &quot;/&quot;.
       *
       * @private
       */
      Slash: "Slash"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.BreadcrumbsSeparator",
      pkg.dist.types.BreadcrumbsSeparator
    );
    /**
     * Different BusyIndicator sizes.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.BusyIndicatorSize
     * @ui5-module-override @ui5/webcomponents dist.types.BusyIndicatorSize
     * @private
     */
    pkg.dist.types.BusyIndicatorSize = {
      /**
       * large size
       *
       * @private
       */
      L: "L",
      /**
       * medium size
       *
       * @private
       */
      M: "M",
      /**
       * small size
       *
       * @private
       */
      S: "S"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.BusyIndicatorSize",
      pkg.dist.types.BusyIndicatorSize
    );
    /**
     * Different BusyIndicator text placements.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.BusyIndicatorTextPlacement
     * @ui5-module-override @ui5/webcomponents dist.types.BusyIndicatorTextPlacement
     * @private
     */
    pkg.dist.types.BusyIndicatorTextPlacement = {
      /**
       * The text will be displayed at the bottom of the busy indicator.
       *
       * @private
       */
      Bottom: "Bottom",
      /**
       * The text will be displayed on top of the busy indicator.
       *
       * @private
       */
      Top: "Top"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.BusyIndicatorTextPlacement",
      pkg.dist.types.BusyIndicatorTextPlacement
    );
    /**
     * Button accessible roles.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ButtonAccessibleRole
     * @ui5-module-override @ui5/webcomponents dist.types.ButtonAccessibleRole
     * @private
     */
    pkg.dist.types.ButtonAccessibleRole = {
      /**
       * Represents Default (button) ARIA role.
       *
       * @private
       */
      Button: "Button",
      /**
       * Represents the ARIA role &quot;link&quot;.
       *
       * @private
       */
      Link: "Link"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ButtonAccessibleRole",
      pkg.dist.types.ButtonAccessibleRole
    );
    /**
     * Determines where the badge will be placed and how it will be styled.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ButtonBadgeDesign
     * @ui5-module-override @ui5/webcomponents dist.types.ButtonBadgeDesign
     * @private
     */
    pkg.dist.types.ButtonBadgeDesign = {
      /**
       * The badge is displayed as an attention dot.
       *
       * @private
       */
      AttentionDot: "AttentionDot",
      /**
       * The badge is displayed after the text, inside the button.
       *
       * @private
       */
      InlineText: "InlineText",
      /**
       * The badge is displayed at the top-end corner of the button.
       *
       * **Note:** According to design guidance, the OverlayText design mode is best used in cozy density to avoid potential visual issues in compact.
       *
       * @private
       */
      OverlayText: "OverlayText"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ButtonBadgeDesign",
      pkg.dist.types.ButtonBadgeDesign
    );
    /**
     * Different Button designs.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ButtonDesign
     * @ui5-module-override @ui5/webcomponents dist.types.ButtonDesign
     * @private
     */
    pkg.dist.types.ButtonDesign = {
      /**
       * attention type
       *
       * @private
       */
      Attention: "Attention",
      /**
       * default type (no special styling)
       *
       * @private
       */
      Default: "Default",
      /**
       * emphasized type
       *
       * @private
       */
      Emphasized: "Emphasized",
      /**
       * reject style (red button)
       *
       * @private
       */
      Negative: "Negative",
      /**
       * accept type (green button)
       *
       * @private
       */
      Positive: "Positive",
      /**
       * transparent type
       *
       * @private
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ButtonDesign",
      pkg.dist.types.ButtonDesign
    );
    /**
     * Determines if the button has special form-related functionality.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ButtonType
     * @ui5-module-override @ui5/webcomponents dist.types.ButtonType
     * @private
     */
    pkg.dist.types.ButtonType = {
      /**
       * The button does not do anything special when inside a form
       *
       * @private
       */
      Button: "Button",
      /**
       * The button acts as a reset button (resets a form)
       *
       * @private
       */
      Reset: "Reset",
      /**
       * The button acts as a submit button (submits a form)
       *
       * @private
       */
      Submit: "Submit"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ButtonType",
      pkg.dist.types.ButtonType
    );
    /**
     * Enum for calendar legend items' types.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.CalendarLegendItemType
     * @ui5-module-override @ui5/webcomponents dist.types.CalendarLegendItemType
     * @private
     */
    pkg.dist.types.CalendarLegendItemType = {
      /**
       * Set when no type is set.
       *
       * @private
       */
      None: "None",
      /**
       * Represents the &quot;NonWorking&quot; item in the calendar legend.
       *
       * @private
       */
      NonWorking: "NonWorking",
      /**
       * Represents the &quot;Type01&quot; item in the calendar legend.
       *
       * @private
       */
      Type01: "Type01",
      /**
       * Represents the &quot;Type02&quot; item in the calendar legend.
       *
       * @private
       */
      Type02: "Type02",
      /**
       * Represents the &quot;Type03&quot; item in the calendar legend.
       *
       * @private
       */
      Type03: "Type03",
      /**
       * Represents the &quot;Type04&quot; item in the calendar legend.
       *
       * @private
       */
      Type04: "Type04",
      /**
       * Represents the &quot;Type05&quot; item in the calendar legend.
       *
       * @private
       */
      Type05: "Type05",
      /**
       * Represents the &quot;Type06&quot; item in the calendar legend.
       *
       * @private
       */
      Type06: "Type06",
      /**
       * Represents the &quot;Type07&quot; item in the calendar legend.
       *
       * @private
       */
      Type07: "Type07",
      /**
       * Represents the &quot;Type08&quot; item in the calendar legend.
       *
       * @private
       */
      Type08: "Type08",
      /**
       * Represents the &quot;Type09&quot; item in the calendar legend.
       *
       * @private
       */
      Type09: "Type09",
      /**
       * Represents the &quot;Type10&quot; item in the calendar legend.
       *
       * @private
       */
      Type10: "Type10",
      /**
       * Represents the &quot;Type11&quot; item in the calendar legend.
       *
       * @private
       */
      Type11: "Type11",
      /**
       * Represents the &quot;Type12&quot; item in the calendar legend.
       *
       * @private
       */
      Type12: "Type12",
      /**
       * Represents the &quot;Type13&quot; item in the calendar legend.
       *
       * @private
       */
      Type13: "Type13",
      /**
       * Represents the &quot;Type14&quot; item in the calendar legend.
       *
       * @private
       */
      Type14: "Type14",
      /**
       * Represents the &quot;Type15&quot; item in the calendar legend.
       *
       * @private
       */
      Type15: "Type15",
      /**
       * Represents the &quot;Type16&quot; item in the calendar legend.
       *
       * @private
       */
      Type16: "Type16",
      /**
       * Represents the &quot;Type17&quot; item in the calendar legend.
       *
       * @private
       */
      Type17: "Type17",
      /**
       * Represents the &quot;Type18&quot; item in the calendar legend.
       *
       * @private
       */
      Type18: "Type18",
      /**
       * Represents the &quot;Type19&quot; item in the calendar legend.
       *
       * @private
       */
      Type19: "Type19",
      /**
       * Represents the &quot;Type20&quot; item in the calendar legend.
       *
       * @private
       */
      Type20: "Type20",
      /**
       * Represents the &quot;Working&quot; item in the calendar legend.
       *
       * @private
       */
      Working: "Working"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.CalendarLegendItemType",
      pkg.dist.types.CalendarLegendItemType
    );
    /**
     * Different Calendar selection mode.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.CalendarSelectionMode
     * @ui5-module-override @ui5/webcomponents dist.types.CalendarSelectionMode
     * @private
     */
    pkg.dist.types.CalendarSelectionMode = {
      /**
       * Several dates can be selected
       *
       * @private
       */
      Multiple: "Multiple",
      /**
       * A range defined by a start date and an end date can be selected
       *
       * @private
       */
      Range: "Range",
      /**
       * Only one date can be selected at a time
       *
       * @private
       */
      Single: "Single"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.CalendarSelectionMode",
      pkg.dist.types.CalendarSelectionMode
    );
    /**
     * The <code>CalendarWeekNumbering</code> enum defines how to calculate calendar weeks. Each
     * value defines:
     * - The first day of the week,
     * - The first week of the year.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.CalendarWeekNumbering
     * @ui5-module-override @ui5/webcomponents dist.types.CalendarWeekNumbering
     * @private
     */
    pkg.dist.types.CalendarWeekNumbering = {
      /**
       * The default calendar week numbering:
       *
       * The framework determines the week numbering scheme; currently it is derived from the
       * active format locale. Future versions of ui5-webcomponents might select a different week numbering
       * scheme.
       *
       * @private
       */
      Default: "Default",
      /**
       * Official calendar week numbering in most of Europe (ISO 8601 standard):
       * Monday is first day of the week, the week containing January 4th is first week of the year.
       *
       * @private
       */
      ISO_8601: "ISO_8601",
      /**
       * Official calendar week numbering in much of the Middle East (Middle Eastern calendar):
       * Saturday is first day of the week, the week containing January 1st is first week of the year.
       *
       * @private
       */
      MiddleEastern: "MiddleEastern",
      /**
       * Official calendar week numbering in the United States, Canada, Brazil, Israel, Japan, and
       * other countries (Western traditional calendar):
       * Sunday is first day of the week, the week containing January 1st is first week of the year.
       *
       * @private
       */
      WesternTraditional: "WesternTraditional"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.CalendarWeekNumbering",
      pkg.dist.types.CalendarWeekNumbering
    );
    /**
     * Different Carousel arrows placement.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.CarouselArrowsPlacement
     * @ui5-module-override @ui5/webcomponents dist.types.CarouselArrowsPlacement
     * @private
     */
    pkg.dist.types.CarouselArrowsPlacement = {
      /**
       * Carousel arrows are placed on the sides of the current Carousel page.
       *
       * @private
       */
      Content: "Content",
      /**
       * Carousel arrows are placed on the sides of the page indicator of the Carousel.
       *
       * @private
       */
      Navigation: "Navigation"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.CarouselArrowsPlacement",
      pkg.dist.types.CarouselArrowsPlacement
    );
    /**
     * Different Carousel page indicator types.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.CarouselPageIndicatorType
     * @ui5-module-override @ui5/webcomponents dist.types.CarouselPageIndicatorType
     * @private
     */
    pkg.dist.types.CarouselPageIndicatorType = {
      /**
       * The page indicator will be visualized as dots if there are fewer than 9 pages.
       * If there are more pages, the page indicator will switch to displaying the current page and the total number of pages. (e.g. X of Y)
       *
       * @private
       */
      Default: "Default",
      /**
       * The page indicator will display the current page and the total number of pages. (e.g. X of Y)
       *
       * @private
       */
      Numeric: "Numeric"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.CarouselPageIndicatorType",
      pkg.dist.types.CarouselPageIndicatorType
    );
    /**
     * Different filtering types of the ComboBox.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ComboBoxFilter
     * @ui5-module-override @ui5/webcomponents dist.types.ComboBoxFilter
     * @private
     */
    pkg.dist.types.ComboBoxFilter = {
      /**
       * Defines contains filtering.
       *
       * @private
       */
      Contains: "Contains",
      /**
       * Removes any filtering applied while typing
       *
       * @private
       */
      None: "None",
      /**
       * Defines filtering by starting symbol of item&#x27;s text.
       *
       * @private
       */
      StartsWith: "StartsWith",
      /**
       * Defines filtering by first symbol of each word of item&#x27;s text.
       *
       * @private
       */
      StartsWithPerTerm: "StartsWithPerTerm"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ComboBoxFilter",
      pkg.dist.types.ComboBoxFilter
    );
    /**
     * Overflow Mode.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ExpandableTextOverflowMode
     * @ui5-module-override @ui5/webcomponents dist.types.ExpandableTextOverflowMode
     * @private
     */
    pkg.dist.types.ExpandableTextOverflowMode = {
      /**
       * Overflowing text is appended in-place.
       *
       * @private
       */
      InPlace: "InPlace",
      /**
       * Full text is displayed in a popover.
       *
       * @private
       */
      Popover: "Popover"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ExpandableTextOverflowMode",
      pkg.dist.types.ExpandableTextOverflowMode
    );
    /**
     * Accessibility modes of the Form.
     *
     * Based on the mode, the Form and its items will render different HTML elements and ARIA attributes,
     * which are appropriate for the use-case.
     *
     * **Usage:**
     * - "Display" mode should be used when the form consists of non-editable (e.g. texts) form items.
     * - "Edit" mode should be used when the form consists of editable (e.g. input fields) form items.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.FormAccessibleMode
     * @ui5-module-override @ui5/webcomponents dist.types.FormAccessibleMode
     * @private
     */
    pkg.dist.types.FormAccessibleMode = {
      /**
       * Display mode.
       *
       * @private
       */
      Display: "Display",
      /**
       * Edit mode.
       *
       * @private
       */
      Edit: "Edit"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.FormAccessibleMode",
      pkg.dist.types.FormAccessibleMode
    );
    /**
     * Different spacing of the form items.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.FormItemSpacing
     * @ui5-module-override @ui5/webcomponents dist.types.FormItemSpacing
     * @private
     */
    pkg.dist.types.FormItemSpacing = {
      /**
       * Large spacing (larger vertical space between form items).
       *
       * @private
       */
      Large: "Large",
      /**
       * Normal spacing (smaller vertical space between form items).
       *
       * @private
       */
      Normal: "Normal"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.FormItemSpacing",
      pkg.dist.types.FormItemSpacing
    );
    /**
     * Different types of Highlight .
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.Highlight
     * @ui5-module-override @ui5/webcomponents dist.types.Highlight
     * @private
     */
    pkg.dist.types.Highlight = {
      /**
       * Critical
       *
       * @private
       */
      Critical: "Critical",
      /**
       * Information
       *
       * @private
       */
      Information: "Information",
      /**
       * Negative
       *
       * @private
       */
      Negative: "Negative",
      /**
       * None
       *
       * @private
       */
      None: "None",
      /**
       * Positive
       *
       * @private
       */
      Positive: "Positive"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.Highlight",
      pkg.dist.types.Highlight
    );
    /**
     * Different Icon semantic designs.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.IconDesign
     * @ui5-module-override @ui5/webcomponents dist.types.IconDesign
     * @private
     */
    pkg.dist.types.IconDesign = {
      /**
       * Contrast design
       *
       * @private
       */
      Contrast: "Contrast",
      /**
       * Critical design
       *
       * @private
       */
      Critical: "Critical",
      /**
       * Default design (brand design)
       *
       * @private
       */
      Default: "Default",
      /**
       * info type
       *
       * @private
       */
      Information: "Information",
      /**
       * Negative design
       *
       * @private
       */
      Negative: "Negative",
      /**
       * Neutral design
       *
       * @private
       */
      Neutral: "Neutral",
      /**
       * Design that indicates an icon which isn&#x27;t interactive
       *
       * @private
       */
      NonInteractive: "NonInteractive",
      /**
       * Positive design
       *
       * @private
       */
      Positive: "Positive"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.IconDesign",
      pkg.dist.types.IconDesign
    );
    /**
     * Different Icon modes.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.IconMode
     * @ui5-module-override @ui5/webcomponents dist.types.IconMode
     * @private
     */
    pkg.dist.types.IconMode = {
      /**
       * Decorative mode.
       * Configures the component to internally render role&#x3D;&quot;presentation&quot; and aria-hidden&#x3D;&quot;true&quot;,
       * making it purely decorative without semantic content or interactivity.
       *
       * @private
       */
      Decorative: "Decorative",
      /**
       * Image mode (by default).
       * Configures the component to internally render role&#x3D;&quot;img&quot;.
       *
       * @private
       */
      Image: "Image",
      /**
       * Interactive mode.
       * Configures the component to internally render role&#x3D;&quot;button&quot;.
       * This mode also supports focus and press handling to enhance interactivity.
       *
       * @private
       */
      Interactive: "Interactive"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.IconMode",
      pkg.dist.types.IconMode
    );
    /**
     * Different filtering types of the Input.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.InputSuggestionsFilter
     * @ui5-module-override @ui5/webcomponents dist.types.InputSuggestionsFilter
     * @private
     */
    pkg.dist.types.InputSuggestionsFilter = {
      /**
       * Defines contains filtering.
       *
       * @private
       */
      Contains: "Contains",
      /**
       * Removes any filtering applied while typing
       *
       * @private
       */
      None: "None",
      /**
       * Defines filtering by starting symbol of item&#x27;s text.
       *
       * @private
       */
      StartsWith: "StartsWith",
      /**
       * Defines filtering by first symbol of each word of item&#x27;s text.
       *
       * @private
       */
      StartsWithPerTerm: "StartsWithPerTerm"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.InputSuggestionsFilter",
      pkg.dist.types.InputSuggestionsFilter
    );
    /**
     * Different input types.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.InputType
     * @ui5-module-override @ui5/webcomponents dist.types.InputType
     * @private
     */
    pkg.dist.types.InputType = {
      /**
       * Used for input fields that must contain an e-mail address.
       *
       * @private
       */
      Email: "Email",
      /**
       * Defines a numeric input field.
       *
       * @private
       */
      Number: "Number",
      /**
       * Defines a password field.
       *
       * @private
       */
      Password: "Password",
      /**
       * Used for input fields that should contain a search term.
       *
       * @private
       */
      Search: "Search",
      /**
       * Used for input fields that should contain a telephone number.
       *
       * @private
       */
      Tel: "Tel",
      /**
       * Defines a one-line text input field:
       *
       * @private
       */
      Text: "Text",
      /**
       * Used for input fields that should contain a URL address.
       *
       * @private
       */
      URL: "URL"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.InputType",
      pkg.dist.types.InputType
    );
    /**
     * Defines the area size around the component that the user can select.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.InteractiveAreaSize
     * @ui5-module-override @ui5/webcomponents dist.types.InteractiveAreaSize
     * @private
     */
    pkg.dist.types.InteractiveAreaSize = {
      /**
       * Enlarged target area size (up to 24px in height) provides users with an enhanced dedicated space to interact with the component.
       *
       * @private
       */
      Large: "Large",
      /**
       * The default target area size (the area taken by the component itself without any extra invisible touch area).
       *
       * @private
       */
      Normal: "Normal"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.InteractiveAreaSize",
      pkg.dist.types.InteractiveAreaSize
    );
    /**
     * Link accessible roles.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.LinkAccessibleRole
     * @ui5-module-override @ui5/webcomponents dist.types.LinkAccessibleRole
     * @private
     */
    pkg.dist.types.LinkAccessibleRole = {
      /**
       * Represents the ARIA role &quot;button&quot;.
       *
       * @private
       */
      Button: "Button",
      /**
       * Represents Default (link) ARIA role.
       *
       * @private
       */
      Link: "Link"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.LinkAccessibleRole",
      pkg.dist.types.LinkAccessibleRole
    );
    /**
     * Different link designs.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.LinkDesign
     * @ui5-module-override @ui5/webcomponents dist.types.LinkDesign
     * @private
     */
    pkg.dist.types.LinkDesign = {
      /**
       * default type (no special styling)
       *
       * @private
       */
      Default: "Default",
      /**
       * emphasized type
       *
       * @private
       */
      Emphasized: "Emphasized",
      /**
       * subtle type (appears as regular text, rather than a link)
       *
       * @private
       */
      Subtle: "Subtle"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.LinkDesign",
      pkg.dist.types.LinkDesign
    );
    /**
     * List accessible roles.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ListAccessibleRole
     * @ui5-module-override @ui5/webcomponents dist.types.ListAccessibleRole
     * @private
     */
    pkg.dist.types.ListAccessibleRole = {
      /**
       * Represents the ARIA role &quot;list&quot;. (by default)
       *
       * @private
       */
      List: "List",
      /**
       * Represents the ARIA role &quot;listbox&quot;.
       *
       * @private
       */
      ListBox: "ListBox",
      /**
       * Represents the ARIA role &quot;menu&quot;.
       *
       * @private
       */
      Menu: "Menu",
      /**
       * Represents the ARIA role &quot;tree&quot;.
       *
       * @private
       */
      Tree: "Tree"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ListAccessibleRole",
      pkg.dist.types.ListAccessibleRole
    );
    /**
     * Different list growing modes.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ListGrowingMode
     * @ui5-module-override @ui5/webcomponents dist.types.ListGrowingMode
     * @private
     */
    pkg.dist.types.ListGrowingMode = {
      /**
       * Component&#x27;s &quot;load-more&quot; is fired upon pressing a &quot;More&quot; button.
       * at the bottom.
       *
       * @private
       */
      Button: "Button",
      /**
       * Component&#x27;s growing is not enabled.
       *
       * @private
       */
      None: "None",
      /**
       * Component&#x27;s &quot;load-more&quot; is fired upon scroll.
       *
       * @private
       */
      Scroll: "Scroll"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ListGrowingMode",
      pkg.dist.types.ListGrowingMode
    );
    /**
     * ListItem accessible roles.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ListItemAccessibleRole
     * @ui5-module-override @ui5/webcomponents dist.types.ListItemAccessibleRole
     * @private
     */
    pkg.dist.types.ListItemAccessibleRole = {
      /**
       * Represents the ARIA role &quot;listitem&quot;. (by default)
       *
       * @private
       */
      ListItem: "ListItem",
      /**
       * Represents the ARIA role &quot;menuitem&quot;.
       *
       * @private
       */
      MenuItem: "MenuItem",
      /**
       * Represents the ARIA role &quot;none&quot;.
       *
       * @private
       */
      None: "None",
      /**
       * Represents the ARIA role &quot;option&quot;.
       *
       * @private
       */
      Option: "Option",
      /**
       * Represents the ARIA role &quot;treeitem&quot;.
       *
       * @private
       */
      TreeItem: "TreeItem"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ListItemAccessibleRole",
      pkg.dist.types.ListItemAccessibleRole
    );
    /**
     * Different list item types.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ListItemType
     * @ui5-module-override @ui5/webcomponents dist.types.ListItemType
     * @private
     */
    pkg.dist.types.ListItemType = {
      /**
       * Indicates that the item is clickable via active feedback when item is pressed.
       *
       * @private
       */
      Active: "Active",
      /**
       * Enables detail button of the list item that fires detail-click event.
       *
       * @private
       */
      Detail: "Detail",
      /**
       * Indicates the list item does not have any active feedback when item is pressed.
       *
       * @private
       */
      Inactive: "Inactive",
      /**
       * Indicates the list item does not have any active feedback when item is pressed,
       * but the item can still be selected when a selection mode is active
       * (via the item body, Space/Enter, or the checkbox/radio).
       * The &#x60;item-click&#x60; event is not fired for items of this type.
       *
       * @private
       */
      InactiveSelectable: "InactiveSelectable",
      /**
       * Enables the type of navigation, which is specified to add an arrow at the end of the items and fires navigate-click event.
       *
       * @private
       */
      Navigation: "Navigation"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ListItemType",
      pkg.dist.types.ListItemType
    );
    /**
     * Different list selection modes.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ListSelectionMode
     * @ui5-module-override @ui5/webcomponents dist.types.ListSelectionMode
     * @private
     */
    pkg.dist.types.ListSelectionMode = {
      /**
       * Delete mode (only one list item can be deleted via provided delete button)
       *
       * @private
       */
      Delete: "Delete",
      /**
       * Multi selection mode (more than one list item can be selected).
       *
       * @private
       */
      Multiple: "Multiple",
      /**
       * Default mode (no selection).
       *
       * @private
       */
      None: "None",
      /**
       * Right-positioned single selection mode (only one list item can be selected).
       *
       * @private
       */
      Single: "Single",
      /**
       * Selected item is highlighted and selection is changed upon arrow navigation
       * (only one list item can be selected - this is always the focused item).
       *
       * @private
       */
      SingleAuto: "SingleAuto",
      /**
       * Selected item is highlighted but no selection element is visible
       * (only one list item can be selected).
       *
       * @private
       */
      SingleEnd: "SingleEnd",
      /**
       * Left-positioned single selection mode (only one list item can be selected).
       *
       * @private
       */
      SingleStart: "SingleStart"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ListSelectionMode",
      pkg.dist.types.ListSelectionMode
    );
    /**
     * Different types of list items separators.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ListSeparator
     * @ui5-module-override @ui5/webcomponents dist.types.ListSeparator
     * @private
     */
    pkg.dist.types.ListSeparator = {
      /**
       * Separators between the items including the last and the first one.
       *
       * @private
       */
      All: "All",
      /**
       * Separators between the items.
       * Note: This enumeration depends on the theme.
       *
       * @private
       */
      Inner: "Inner",
      /**
       * No item separators.
       *
       * @private
       */
      None: "None"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ListSeparator",
      pkg.dist.types.ListSeparator
    );
    /**
     * Menu item group check modes.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.MenuItemGroupCheckMode
     * @ui5-module-override @ui5/webcomponents dist.types.MenuItemGroupCheckMode
     * @private
     */
    pkg.dist.types.MenuItemGroupCheckMode = {
      /**
       * Multiple items check mode (multiple items in a group can be checked at a time)
       *
       * @private
       */
      Multiple: "Multiple",
      /**
       * default type (items in a group cannot be checked)
       *
       * @private
       */
      None: "None",
      /**
       * Single item check mode (only one item in a group can be checked at a time)
       *
       * @private
       */
      Single: "Single"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.MenuItemGroupCheckMode",
      pkg.dist.types.MenuItemGroupCheckMode
    );
    /**
     * MessageStrip designs.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.MessageStripDesign
     * @ui5-module-override @ui5/webcomponents dist.types.MessageStripDesign
     * @private
     */
    pkg.dist.types.MessageStripDesign = {
      /**
       * Message uses custom color set 1
       *
       * @private
       */
      ColorSet1: "ColorSet1",
      /**
       * Message uses custom color set 2
       *
       * @private
       */
      ColorSet2: "ColorSet2",
      /**
       * Message is a warning
       *
       * @private
       */
      Critical: "Critical",
      /**
       * Message should be just an information
       *
       * @private
       */
      Information: "Information",
      /**
       * Message is an error
       *
       * @private
       */
      Negative: "Negative",
      /**
       * Message is a success message
       *
       * @private
       */
      Positive: "Positive"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.MessageStripDesign",
      pkg.dist.types.MessageStripDesign
    );
    /**
     * Different notification list growing modes.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.NotificationListGrowingMode
     * @ui5-module-override @ui5/webcomponents dist.types.NotificationListGrowingMode
     * @private
     */
    pkg.dist.types.NotificationListGrowingMode = {
      /**
       * Component&#x27;s &quot;load-more&quot; is fired upon pressing a &quot;More&quot; button.
       * at the bottom.
       *
       * @private
       */
      Button: "Button",
      /**
       * Component&#x27;s growing is not enabled.
       *
       * @private
       */
      None: "None"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.NotificationListGrowingMode",
      pkg.dist.types.NotificationListGrowingMode
    );
    /**
     * Tabs overflow mode in TabContainer.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.OverflowMode
     * @ui5-module-override @ui5/webcomponents dist.types.OverflowMode
     * @private
     */
    pkg.dist.types.OverflowMode = {
      /**
       * End type is used if there should be only one overflow with hidden the tabs at the end of the tab container.
       *
       * @private
       */
      End: "End",
      /**
       * StartAndEnd type is used if there should be two overflows on both ends of the tab container.
       *
       * @private
       */
      StartAndEnd: "StartAndEnd"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.OverflowMode",
      pkg.dist.types.OverflowMode
    );
    /**
     * Panel accessible roles.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.PanelAccessibleRole
     * @ui5-module-override @ui5/webcomponents dist.types.PanelAccessibleRole
     * @private
     */
    pkg.dist.types.PanelAccessibleRole = {
      /**
       * Represents the ARIA role &quot;complementary&quot;.
       * A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
       *
       * @private
       */
      Complementary: "Complementary",
      /**
       * Represents the ARIA role &quot;Form&quot;.
       * A landmark region that contains a collection of items and objects that, as a whole, create a form.
       *
       * @private
       */
      Form: "Form",
      /**
       * Represents the ARIA role &quot;Region&quot;.
       * A section of a page, that is important enough to be included in a page summary or table of contents.
       *
       * @private
       */
      Region: "Region"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.PanelAccessibleRole",
      pkg.dist.types.PanelAccessibleRole
    );
    /**
     * Popover horizontal align types.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.PopoverHorizontalAlign
     * @ui5-module-override @ui5/webcomponents dist.types.PopoverHorizontalAlign
     * @private
     */
    pkg.dist.types.PopoverHorizontalAlign = {
      /**
       * Popover is centered.
       *
       * @private
       */
      Center: "Center",
      /**
       * Popover is aligned with the end of the target.
       *
       * @private
       */
      End: "End",
      /**
       * Popover is aligned with the start of the target.
       *
       * @private
       */
      Start: "Start",
      /**
       * Popover is stretched.
       *
       * @private
       */
      Stretch: "Stretch"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.PopoverHorizontalAlign",
      pkg.dist.types.PopoverHorizontalAlign
    );
    /**
     * Popover placements.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.PopoverPlacement
     * @ui5-module-override @ui5/webcomponents dist.types.PopoverPlacement
     * @private
     */
    pkg.dist.types.PopoverPlacement = {
      /**
       * Popover will be placed at the bottom of the reference element.
       *
       * @private
       */
      Bottom: "Bottom",
      /**
       * Popover will be placed at the end of the reference element.
       *
       * @private
       */
      End: "End",
      /**
       * Popover will be placed at the start of the reference element.
       *
       * @private
       */
      Start: "Start",
      /**
       * Popover will be placed at the top of the reference element.
       *
       * @private
       */
      Top: "Top"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.PopoverPlacement",
      pkg.dist.types.PopoverPlacement
    );
    /**
     * Popover vertical align types.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.PopoverVerticalAlign
     * @ui5-module-override @ui5/webcomponents dist.types.PopoverVerticalAlign
     * @private
     */
    pkg.dist.types.PopoverVerticalAlign = {
      /**
       * Popover will be placed at the bottom of the reference control.
       *
       * @private
       */
      Bottom: "Bottom",
      /**
       * Center
       *
       * @private
       */
      Center: "Center",
      /**
       * Popover will be streched
       *
       * @private
       */
      Stretch: "Stretch",
      /**
       * Popover will be placed at the top of the reference control.
       *
       * @private
       */
      Top: "Top"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.PopoverVerticalAlign",
      pkg.dist.types.PopoverVerticalAlign
    );
    /**
     * Popup accessible roles.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.PopupAccessibleRole
     * @ui5-module-override @ui5/webcomponents dist.types.PopupAccessibleRole
     * @private
     */
    pkg.dist.types.PopupAccessibleRole = {
      /**
       * Represents the ARIA role &quot;alertdialog&quot;.
       *
       * @private
       */
      AlertDialog: "AlertDialog",
      /**
       * Represents the ARIA role &quot;dialog&quot;.
       *
       * @private
       */
      Dialog: "Dialog",
      /**
       * Represents no ARIA role.
       *
       * @private
       */
      None: "None"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.PopupAccessibleRole",
      pkg.dist.types.PopupAccessibleRole
    );
    /**
     * Different types of Priority.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.Priority
     * @ui5-module-override @ui5/webcomponents dist.types.Priority
     * @private
     */
    pkg.dist.types.Priority = {
      /**
       * High priority.
       *
       * @private
       */
      High: "High",
      /**
       * Low priority.
       *
       * @private
       */
      Low: "Low",
      /**
       * Medium priority.
       *
       * @private
       */
      Medium: "Medium",
      /**
       * Default, none priority.
       *
       * @private
       */
      None: "None"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.Priority",
      pkg.dist.types.Priority
    );
    /**
     * Types of icon sizes used in the RatingIndicator.
     * Provides predefined size categories to ensure consistent scaling and spacing of icons.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.RatingIndicatorSize
     * @ui5-module-override @ui5/webcomponents dist.types.RatingIndicatorSize
     * @private
     */
    pkg.dist.types.RatingIndicatorSize = {
      /**
       * Large size for prominent or spacious layouts.
       *
       * @private
       */
      L: "L",
      /**
       * Medium size, used as the default option.
       * Offers a balanced appearance for most scenarios.
       *
       * @private
       */
      M: "M",
      /**
       * Small size for compact layouts.
       *
       * @private
       */
      S: "S"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.RatingIndicatorSize",
      pkg.dist.types.RatingIndicatorSize
    );
    /**
     * Different SegmentedButton selection modes.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.SegmentedButtonSelectionMode
     * @ui5-module-override @ui5/webcomponents dist.types.SegmentedButtonSelectionMode
     * @private
     */
    pkg.dist.types.SegmentedButtonSelectionMode = {
      /**
       * Multiple items can be selected at a time. All items can be deselected.
       *
       * @private
       */
      Multiple: "Multiple",
      /**
       * There is always one selected. Selecting one deselects the previous one.
       *
       * @private
       */
      Single: "Single"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.SegmentedButtonSelectionMode",
      pkg.dist.types.SegmentedButtonSelectionMode
    );
    /**
     * Defines the separator types for Select component two-column layout.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.SelectTextSeparator
     * @ui5-module-override @ui5/webcomponents dist.types.SelectTextSeparator
     * @private
     */
    pkg.dist.types.SelectTextSeparator = {
      /**
       * Will show bullet(·) as separator on two columns layout when Select is in read-only mode.
       *
       * @private
       */
      Bullet: "Bullet",
      /**
       * Will show N-dash(–) as separator on two columns layout when Select is in read-only mode.
       *
       * @private
       */
      Dash: "Dash",
      /**
       * Will show vertical line(|) as separator on two columns layout when Select is in read-only mode.
       *
       * @private
       */
      VerticalLine: "VerticalLine"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.SelectTextSeparator",
      pkg.dist.types.SelectTextSeparator
    );
    /**
     * Different types of SemanticColor.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.SemanticColor
     * @ui5-module-override @ui5/webcomponents dist.types.SemanticColor
     * @private
     */
    pkg.dist.types.SemanticColor = {
      /**
       * Critical color
       *
       * @private
       */
      Critical: "Critical",
      /**
       * Default color (brand color)
       *
       * @private
       */
      Default: "Default",
      /**
       * Negative color
       *
       * @private
       */
      Negative: "Negative",
      /**
       * Neutral color.
       *
       * @private
       */
      Neutral: "Neutral",
      /**
       * Positive color
       *
       * @private
       */
      Positive: "Positive"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.SemanticColor",
      pkg.dist.types.SemanticColor
    );
    /**
     * Different types of Switch designs.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.SwitchDesign
     * @ui5-module-override @ui5/webcomponents dist.types.SwitchDesign
     * @private
     */
    pkg.dist.types.SwitchDesign = {
      /**
       * Defines the Switch as Graphical
       *
       * @private
       */
      Graphical: "Graphical",
      /**
       * Defines the Switch as Textual
       *
       * @private
       */
      Textual: "Textual"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.SwitchDesign",
      pkg.dist.types.SwitchDesign
    );
    /**
     * Tab layout of TabContainer.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TabLayout
     * @ui5-module-override @ui5/webcomponents dist.types.TabLayout
     * @private
     */
    pkg.dist.types.TabLayout = {
      /**
       * Inline type, the tab &quot;main text&quot; and &quot;additionalText&quot; are displayed horizotally.
       *
       * @private
       */
      Inline: "Inline",
      /**
       * Standard type, the tab &quot;main text&quot; and &quot;additionalText&quot; are displayed vertically.
       *
       * @private
       */
      Standard: "Standard"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TabLayout",
      pkg.dist.types.TabLayout
    );
    /**
     * Alignment of the &lt;ui5-table-cell&gt; component.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TableCellHorizontalAlign
     * @ui5-module-override @ui5/webcomponents dist.types.TableCellHorizontalAlign
     * @private
     */
    pkg.dist.types.TableCellHorizontalAlign = {
      /**
       * Center
       *
       * @private
       */
      Center: "Center",
      /**
       * End
       *
       * @private
       */
      End: "End",
      /**
       * Left
       *
       * @private
       */
      Left: "Left",
      /**
       * Right
       *
       * @private
       */
      Right: "Right",
      /**
       * Start
       *
       * @private
       */
      Start: "Start"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TableCellHorizontalAlign",
      pkg.dist.types.TableCellHorizontalAlign
    );
    /**
     * Growing mode of the &lt;ui5-table&gt; component.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TableGrowingMode
     * @ui5-module-override @ui5/webcomponents dist.types.TableGrowingMode
     * @private
     */
    pkg.dist.types.TableGrowingMode = {
      /**
       * Renders a growing button, which can be pressed to load more data.
       *
       * @private
       */
      Button: "Button",
      /**
       * Scroll to load more data.
       *
       * **Note:** If the table is not scrollable, a growing button will be rendered instead to ensure growing functionality.
       *
       * @private
       */
      Scroll: "Scroll"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TableGrowingMode",
      pkg.dist.types.TableGrowingMode
    );
    /**
     * Overflow mode of the `ui5-table` component.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TableOverflowMode
     * @ui5-module-override @ui5/webcomponents dist.types.TableOverflowMode
     * @private
     */
    pkg.dist.types.TableOverflowMode = {
      /**
       * Pops in columns, that do not fit into the table anymore.
       *
       * @private
       */
      Popin: "Popin",
      /**
       * Shows a scrollbar, when the table cannot fit all columns.
       *
       * @private
       */
      Scroll: "Scroll"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TableOverflowMode",
      pkg.dist.types.TableOverflowMode
    );
    /**
     * Selection behavior of the `ui5-table` selection components.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TableSelectionBehavior
     * @ui5-module-override @ui5/webcomponents dist.types.TableSelectionBehavior
     * @private
     */
    pkg.dist.types.TableSelectionBehavior = {
      /**
       * Rows can only be selected by clicking directly on the row, as the row selector column is hidden.
       *
       * **Note:** In this mode, the &#x60;row-click&#x60; event of the &#x60;ui5-table&#x60; component is not fired.
       *
       * @private
       */
      RowOnly: "RowOnly",
      /**
       * Rows can only be selected by using the row selector column.
       *
       * @private
       */
      RowSelector: "RowSelector"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TableSelectionBehavior",
      pkg.dist.types.TableSelectionBehavior
    );
    /**
     * Selection modes of the &lt;ui5-table&gt; component.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TableSelectionMode
     * @ui5-module-override @ui5/webcomponents dist.types.TableSelectionMode
     * @private
     */
    pkg.dist.types.TableSelectionMode = {
      /**
       * Multi selection mode (more than one table row can be selected).
       *
       * @private
       */
      Multiple: "Multiple",
      /**
       * Default mode (no selection).
       *
       * @private
       */
      None: "None",
      /**
       * Single selection mode (only one table row can be selected).
       *
       * @private
       */
      Single: "Single"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TableSelectionMode",
      pkg.dist.types.TableSelectionMode
    );
    /**
     * Selectors of the table header row in multi-selection scenarios.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TableSelectionMultiHeaderSelector
     * @ui5-module-override @ui5/webcomponents dist.types.TableSelectionMultiHeaderSelector
     * @private
     */
    pkg.dist.types.TableSelectionMultiHeaderSelector = {
      /**
       * Renders an icon in the table header row that removes the selection of all rows.
       *
       * @private
       */
      ClearAll: "ClearAll",
      /**
       * Renders a checkbox in the table header row that toggles the selection of all rows.
       *
       * @private
       */
      SelectAll: "SelectAll"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TableSelectionMultiHeaderSelector",
      pkg.dist.types.TableSelectionMultiHeaderSelector
    );
    /**
     * Defines tag design types.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TagDesign
     * @ui5-module-override @ui5/webcomponents dist.types.TagDesign
     * @private
     */
    pkg.dist.types.TagDesign = {
      /**
       * Critical design
       *
       * @private
       */
      Critical: "Critical",
      /**
       * Information design
       *
       * @private
       */
      Information: "Information",
      /**
       * Negative design
       *
       * @private
       */
      Negative: "Negative",
      /**
       * Neutral design
       *
       * @private
       */
      Neutral: "Neutral",
      /**
       * Positive design
       *
       * @private
       */
      Positive: "Positive",
      /**
       * Set1 of generic indication colors that are intended for industry-specific use cases
       *
       * @private
       */
      Set1: "Set1",
      /**
       * Set2 of generic indication colors that are intended for industry-specific use cases
       *
       * @private
       */
      Set2: "Set2"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TagDesign",
      pkg.dist.types.TagDesign
    );
    /**
     * Predefined sizes for the tag.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TagSize
     * @ui5-module-override @ui5/webcomponents dist.types.TagSize
     * @private
     */
    pkg.dist.types.TagSize = {
      /**
       * Large size of the tag
       *
       * @private
       */
      L: "L",
      /**
       * Small size of the tag
       *
       * @private
       */
      S: "S"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TagSize",
      pkg.dist.types.TagSize
    );
    /**
     * Determines when the character counter of `ui5-textarea` is displayed.
     *
     * @enum {string}
     * @alias module:ui5/webcomponents/dist/types/TextAreaCounterMode
     * @ui5-module-override @ui5/webcomponents dist.types.TextAreaCounterMode
     * @private
     */
    pkg["TextAreaCounterMode"] = {
      /**
       * The character counter is always visible below the component. Characters exceeding
       * the &#x60;maxlength&#x60; value are selected on paste and the counter displays their number.
       *
       * @private
       */
      Always: "Always",
      /**
       * The character counter is shown only when the component is focused, when the character
       * limit is exceeded, or when &#x60;valueState&#x60; is &#x60;Critical&#x60; or &#x60;Negative&#x60;. Space for the
       * counter is always reserved to prevent layout shifts.
       *
       * @private
       */
      Auto: "Auto",
      /**
       * The character counter is never shown. The &#x60;maxlength&#x60; property acts as a hard cap
       * and the user is not allowed to enter more characters than allowed.
       *
       * @private
       */
      None: "None"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TextAreaCounterMode",
      pkg["TextAreaCounterMode"]
    );
    /**
     * Empty Indicator Mode.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TextEmptyIndicatorMode
     * @ui5-module-override @ui5/webcomponents dist.types.TextEmptyIndicatorMode
     * @private
     */
    pkg.dist.types.TextEmptyIndicatorMode = {
      /**
       * Empty indicator is never rendered.
       *
       * @private
       */
      Off: "Off",
      /**
       * Empty indicator is rendered always when the component&#x27;s content is empty.
       *
       * @private
       */
      On: "On"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TextEmptyIndicatorMode",
      pkg.dist.types.TextEmptyIndicatorMode
    );
    /**
     * Different types of Title level.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.TitleLevel
     * @ui5-module-override @ui5/webcomponents dist.types.TitleLevel
     * @private
     */
    pkg.dist.types.TitleLevel = {
      /**
       * Renders &#x60;h1&#x60; tag.
       *
       * @private
       */
      H1: "H1",
      /**
       * Renders &#x60;h2&#x60; tag.
       *
       * @private
       */
      H2: "H2",
      /**
       * Renders &#x60;h3&#x60; tag.
       *
       * @private
       */
      H3: "H3",
      /**
       * Renders &#x60;h4&#x60; tag.
       *
       * @private
       */
      H4: "H4",
      /**
       * Renders &#x60;h5&#x60; tag.
       *
       * @private
       */
      H5: "H5",
      /**
       * Renders &#x60;h6&#x60; tag.
       *
       * @private
       */
      H6: "H6"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.TitleLevel",
      pkg.dist.types.TitleLevel
    );
    /**
     * Toast placement.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ToastPlacement
     * @ui5-module-override @ui5/webcomponents dist.types.ToastPlacement
     * @private
     */
    pkg.dist.types.ToastPlacement = {
      /**
       * Toast is placed at the &#x60;BottomCenter&#x60; position of its container.
       * Default placement (no selection)
       *
       * @private
       */
      BottomCenter: "BottomCenter",
      /**
       * Toast is placed at the &#x60;BottomEnd&#x60; position of its container.
       *
       * @private
       */
      BottomEnd: "BottomEnd",
      /**
       * Toast is placed at the &#x60;BottomStart&#x60; position of its container.
       *
       * @private
       */
      BottomStart: "BottomStart",
      /**
       * Toast is placed at the &#x60;MiddleCenter&#x60; position of its container.
       *
       * @private
       */
      MiddleCenter: "MiddleCenter",
      /**
       * Toast is placed at the &#x60;MiddleEnd&#x60; position of its container.
       *
       * @private
       */
      MiddleEnd: "MiddleEnd",
      /**
       * Toast is placed at the &#x60;MiddleStart&#x60; position of its container.
       *
       * @private
       */
      MiddleStart: "MiddleStart",
      /**
       * Toast is placed at the &#x60;TopCenter&#x60; position of its container.
       *
       * @private
       */
      TopCenter: "TopCenter",
      /**
       * Toast is placed at the &#x60;TopEnd&#x60; position of its container.
       *
       * @private
       */
      TopEnd: "TopEnd",
      /**
       * Toast is placed at the &#x60;TopStart&#x60; position of its container.
       *
       * @private
       */
      TopStart: "TopStart"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ToastPlacement",
      pkg.dist.types.ToastPlacement
    );
    /**
     * Defines which direction the items of ui5-toolbar will be aligned.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ToolbarAlign
     * @ui5-module-override @ui5/webcomponents dist.types.ToolbarAlign
     * @private
     */
    pkg.dist.types.ToolbarAlign = {
      /**
       * Toolbar items are situated at the &#x60;end&#x60; of the Toolbar
       *
       * @private
       */
      End: "End",
      /**
       * Toolbar items are situated at the &#x60;start&#x60; of the Toolbar
       *
       * @private
       */
      Start: "Start"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ToolbarAlign",
      pkg.dist.types.ToolbarAlign
    );
    /**
     * Defines the available toolbar designs.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ToolbarDesign
     * @ui5-module-override @ui5/webcomponents dist.types.ToolbarDesign
     * @private
     */
    pkg.dist.types.ToolbarDesign = {
      /**
       * The toolbar and its content will be displayed with solid background.
       *
       * @private
       */
      Solid: "Solid",
      /**
       * The toolbar and its content will be displayed with transparent background.
       *
       * @private
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ToolbarDesign",
      pkg.dist.types.ToolbarDesign
    );
    /**
     * Defines the priority of the toolbar item to go inside overflow popover.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.ToolbarItemOverflowBehavior
     * @ui5-module-override @ui5/webcomponents dist.types.ToolbarItemOverflowBehavior
     * @private
     */
    pkg.dist.types.ToolbarItemOverflowBehavior = {
      /**
       * When set, the item will be always part of the overflow part of ui5-toolbar.
       *
       * @private
       */
      AlwaysOverflow: "AlwaysOverflow",
      /**
       * The item is presented inside the toolbar and goes in the popover, when there is not enough space.
       *
       * @private
       */
      Default: "Default",
      /**
       * When set, the item will never go to the overflow popover.
       *
       * @private
       */
      NeverOverflow: "NeverOverflow"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.ToolbarItemOverflowBehavior",
      pkg.dist.types.ToolbarItemOverflowBehavior
    );
    /**
     * Different types of wrapping.
     *
     * @enum {string}
     * @alias module:@ui5/webcomponents.dist.types.WrappingType
     * @ui5-module-override @ui5/webcomponents dist.types.WrappingType
     * @private
     */
    pkg.dist.types.WrappingType = {
      /**
       * The text will be truncated with an ellipsis.
       *
       * @private
       */
      None: "None",
      /**
       * The text will wrap. The words will not be broken based on hyphenation.
       *
       * @private
       */
      Normal: "Normal"
    };
    registerEnum(
      "ui5.webcomponents.dist.types.WrappingType",
      pkg.dist.types.WrappingType
    );

    // Interfaces
    /**
     * Interface for components that represent an avatar and may be slotted in numerous higher-order components such as `ui5-avatar-group`
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.AvatarGroup.IAvatarGroupItem
     * @ui5-module-override @ui5/webcomponents IAvatarGroupItem
     * @private
     */
    /**
     * Interface for components that may be used as a button inside numerous higher-order components
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.Button.IButton
     * @ui5-module-override @ui5/webcomponents IButton
     * @private
     */
    /**
     * Interface for components that may be slotted inside a `ui5-calendar`.
     *
     * **Note:** Use with `ui5-date` or `ui5-date-range` as calendar date selection types.
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.Calendar.ICalendarSelectedDates
     * @ui5-module-override @ui5/webcomponents ICalendarSelectedDates
     * @private
     */
    /**
     * Interface for components that may be used inside a `ui5-color-palette` or `ui5-color-palette-popover`
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.ColorPalette.IColorPaletteItem
     * @ui5-module-override @ui5/webcomponents IColorPaletteItem
     * @private
     */
    /**
     * Interface for components that may be slotted inside a `ui5-combobox`
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.ComboBox.IComboBoxItem
     * @ui5-module-override @ui5/webcomponents IComboBoxItem
     * @private
     */
    /**
     * Represents a dynamic date range option used by the `ui5-dynamic-date-range` component.
     *
     * Represents a dynamic date range option used for handling dynamic date ranges.
     * This interface defines the structure and behavior required for implementing
     * dynamic date range options, including formatting, parsing, validation, and
     * conversion of date range values.
     *
     *  * Properties:
     * - `icon`: The icon associated with the dynamic date range option, typically used for UI representation.
     * - `operator`: A unique operator identifying the dynamic date range option.
     * - `text`: The display text for the dynamic date range option.
     * - `template` (optional): A JSX template for rendering the dynamic date range option.
     *
     * Methods:
     * - `format(value: DynamicDateRangeValue): string`: Formats the given dynamic date range value into a string representation.
     * - `parse(value: string): DynamicDateRangeValue | undefined`: Parses a string into a dynamic date range value.
     * - `toDates(value: DynamicDateRangeValue): Array<Date>`: Converts a dynamic date range value into an array of `Date` objects.
     * - `handleSelectionChange?(event: CustomEvent): DynamicDateRangeValue | undefined`: (Optional) Handles selection changes in the UI of the dynamic date range option.
     * - `isValidString(value: string): boolean`: Validates whether a given string is a valid representation of the dynamic date range value.
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.DynamicDateRange.IDynamicDateRangeOption
     * @ui5-module-override @ui5/webcomponents IDynamicDateRangeOption
     * @private
     */
    /**
     * Interface for components that can be slotted inside `ui5-form` as items.
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.Form.IFormItem
     * @ui5-module-override @ui5/webcomponents IFormItem
     * @private
     */
    /**
     * Interface for components that represent an icon, usable in numerous higher-order components
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.Icon.IIcon
     * @ui5-module-override @ui5/webcomponents IIcon
     * @private
     */
    /**
     * Interface for components that represent a suggestion item, usable in `ui5-input`
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.Input.IInputSuggestionItem
     * @ui5-module-override @ui5/webcomponents IInputSuggestionItem
     * @private
     */
    /**
     * Interface for components that may be slotted inside a `ui5-menu`.
     *
     * **Note:** Use with `ui5-menu-item` or `ui5-menu-separator`. Implementing the interface does not guarantee that any other classes can work with the `ui5-menu`.
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.Menu.IMenuItem
     * @ui5-module-override @ui5/webcomponents IMenuItem
     * @private
     */
    /**
     * Interface for components that may be slotted inside a `ui5-multi-combobox` as items
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.MultiComboBox.IMultiComboBoxItem
     * @ui5-module-override @ui5/webcomponents IMultiComboBoxItem
     * @private
     */
    /**
     * Interface for components that may be slotted inside `ui5-segmented-button` as items
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.SegmentedButton.ISegmentedButtonItem
     * @ui5-module-override @ui5/webcomponents ISegmentedButtonItem
     * @private
     */
    /**
     * Interface for components that may be slotted inside `ui5-select` as options
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.Select.IOption
     * @ui5-module-override @ui5/webcomponents IOption
     * @private
     */
    /**
     * Interface for group containers slotted inside `ui5-select`
     *
     * @interface
     * @name module:ui5/webcomponents/dist/Select.IOptionGroup
     * @ui5-module-override @ui5/webcomponents IOptionGroup
     * @private
     */
    /**
     * Interface for components that may be slotted inside `ui5-tabcontainer` as items
     *
     * **Note:** Use directly `ui5-tab` or `ui5-tab-seprator`. Implementing the interface does not guarantee that the class can work as a tab.
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.TabContainer.ITab
     * @ui5-module-override @ui5/webcomponents ITab
     * @private
     */
    /**
     * Interface for components that can be slotted inside the `features` slot of the `ui5-table`.
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.Table.ITableFeature
     * @ui5-module-override @ui5/webcomponents ITableFeature
     * @private
     */
    /**
     * Interface for components that can be slotted inside the `features` slot of the `ui5-table`
     * and provide growing/data loading functionality.
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.Table.ITableGrowing
     * @ui5-module-override @ui5/webcomponents ITableGrowing
     * @private
     */
    /**
     * Interface for the slotted item in `ui5-toolbar-item`.
     *
     * It could be any HTMLElement or UI5 Web Component with option to specify custom overflow closing events and overflow behavior.
     * Components that also implement `IToolbarArrowNavProvider` can report their internal navigation boundary
     * state to the toolbar for caret-aware arrow-key handling.
     *
     * @interface
     * @name module:@ui5/webcomponents.dist.ToolbarItem.IToolbarItemContent
     * @ui5-module-override @ui5/webcomponents IToolbarItemContent
     * @private
     */

    // marker to threat this as an ES module to support named exports
    pkg.__esModule = true;

    return pkg;
  }
);
