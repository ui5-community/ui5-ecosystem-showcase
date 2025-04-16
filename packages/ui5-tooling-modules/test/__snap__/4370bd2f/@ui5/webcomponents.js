/*!
 * ${copyright}
 */
sap.ui.define([
	"ui5/ecosystem/demo/app/resources/webcomponents",
  "sap/ui/base/DataType",
  "ui5/ecosystem/demo/app/resources/@ui5/webcomponents-base",
], function(
	WebCPackage,
  DataType,
) {
  "use strict";
  const { registerEnum } = DataType;

  const pkg = {
    "_ui5metadata":
{
  "name": "@ui5/webcomponents",
  "version": "2.8.0",
  "dependencies": [
    "sap.ui.core"
  ],
  "types": [
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.AvatarColorScheme",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.AvatarGroupType",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.AvatarShape",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.AvatarSize",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BackgroundDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BarDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BorderDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BreadcrumbsDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BreadcrumbsSeparator",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BusyIndicatorSize",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BusyIndicatorTextPlacement",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonAccessibleRole",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonBadgeDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonType",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CalendarLegendItemType",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CalendarSelectionMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CalendarWeekNumbering",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CarouselArrowsPlacement",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CarouselPageIndicatorType",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ComboBoxFilter",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ExpandableTextOverflowMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.FormItemSpacing",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.Highlight",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IconDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IconMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.InputType",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.InteractiveAreaSize",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.LinkAccessibleRole",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.LinkDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListAccessibleRole",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListGrowingMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListItemAccessibleRole",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListItemType",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListSelectionMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListSeparator",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.MessageStripDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.NotificationListGrowingMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.OverflowMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PanelAccessibleRole",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PopoverHorizontalAlign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PopoverPlacement",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PopoverVerticalAlign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PopupAccessibleRole",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.Priority",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.RatingIndicatorSize",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.SegmentedButtonSelectionMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.SemanticColor",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.SwitchDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TabLayout",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TableCellHorizontalAlign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TableGrowingMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TableOverflowMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TableSelectionMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TagDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TagSize",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TextEmptyIndicatorMode",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TitleLevel",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ToastPlacement",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ToolbarAlign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ToolbarDesign",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ToolbarItemOverflowBehavior",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.WrappingType"
  ],
  "interfaces": [
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IAvatarGroupItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IButton",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ICalendarSelectedDates",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IColorPaletteItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IComboBoxItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IFormItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IIcon",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IInputSuggestionItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IMenuItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IMultiComboBoxItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ISegmentedButtonItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IOption",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ITab",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ITableFeature",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ITableGrowing"
  ],
  "controls": [
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Avatar",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.AvatarGroup",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Bar",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Breadcrumbs",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.BreadcrumbsItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.BusyIndicator",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Button",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ButtonBadge",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Calendar",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.CalendarDate",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.CalendarDateRange",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.CalendarLegend",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.CalendarLegendItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Card",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.CardHeader",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Carousel",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.CheckBox",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ColorPalette",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ColorPaletteItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ColorPalettePopover",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ColorPicker",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ComboBox",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ComboBoxItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ComboBoxItemGroup",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.DatePicker",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.DateRangePicker",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.DateTimePicker",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Dialog",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ExpandableText",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.FileUploader",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Form",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.FormGroup",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.FormItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Icon",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Input",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Label",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Link",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.List",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ListItemCustom",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ListItemGroup",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ListItemStandard",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Menu",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.MenuItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.MenuSeparator",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.MessageStrip",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.MultiComboBox",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.MultiComboBoxItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.MultiComboBoxItemGroup",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.MultiInput",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Option",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.OptionCustom",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Panel",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Popover",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ProgressIndicator",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.RadioButton",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.RangeSlider",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.RatingIndicator",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ResponsivePopover",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.SegmentedButton",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.SegmentedButtonItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Select",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Slider",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.SpecialCalendarDate",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.SplitButton",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.StepInput",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.SuggestionItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.SuggestionItemCustom",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.SuggestionItemGroup",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Switch",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Tab",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TabContainer",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TabSeparator",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Table",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableCell",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableGrowing",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableHeaderCell",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableHeaderCellActionAI",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableHeaderRow",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableRow",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableRowAction",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableRowActionNavigation",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableSelection",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableSelectionMulti",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableSelectionSingle",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TableVirtualizer",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Tag",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Text",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TextArea",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TimePicker",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Title",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Toast",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ToggleButton",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Token",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Tokenizer",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Toolbar",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ToolbarButton",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ToolbarSelect",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ToolbarSelectOption",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ToolbarSeparator",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.ToolbarSpacer",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.Tree",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TreeItem",
    "ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.dist.TreeItemCustom"
  ],
  "elements": [],
  "rootPath": "ui5/ecosystem/demo/app/resources/"
}
  };

	if (WebCPackage) {
		Object.keys(WebCPackage).forEach((key) => {
			if (key !== "default") {
				pkg[key] = WebCPackage[key];
			} else {
				if (typeof WebCPackage[key] === "object") {
					Object.assign(pkg, WebCPackage[key]);
				}
			}
		});
	}

  /**
 * Different types of AvatarColorScheme.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.AvatarColorScheme
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents AvatarColorScheme
 */
  pkg["AvatarColorScheme"] = {
    /**
 * 
 * @public
 */
    "Accent1": "Accent1",
    /**
 * 
 * @public
 */
    "Accent2": "Accent2",
    /**
 * 
 * @public
 */
    "Accent3": "Accent3",
    /**
 * 
 * @public
 */
    "Accent4": "Accent4",
    /**
 * 
 * @public
 */
    "Accent5": "Accent5",
    /**
 * 
 * @public
 */
    "Accent6": "Accent6",
    /**
 * 
 * @public
 */
    "Accent7": "Accent7",
    /**
 * 
 * @public
 */
    "Accent8": "Accent8",
    /**
 * 
 * @public
 */
    "Accent9": "Accent9",
    /**
 * 
 * @public
 */
    "Accent10": "Accent10",
    /**
 * 
 * @public
 */
    "Placeholder": "Placeholder",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.AvatarColorScheme", pkg["AvatarColorScheme"]);
  /**
 * Different types of AvatarGroupType.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.AvatarGroupType
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents AvatarGroupType
 */
  pkg["AvatarGroupType"] = {
    /**
 * The avatars are displayed as partially overlapped on top of each other and the entire group has one click or tap area.
 * @public
 */
    "Group": "Group",
    /**
 * The avatars are displayed side-by-side and each avatar has its own click or tap area.
 * @public
 */
    "Individual": "Individual",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.AvatarGroupType", pkg["AvatarGroupType"]);
  /**
 * Different types of AvatarShape.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.AvatarShape
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents AvatarShape
 */
  pkg["AvatarShape"] = {
    /**
 * Circular shape.
 * @public
 */
    "Circle": "Circle",
    /**
 * Square shape.
 * @public
 */
    "Square": "Square",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.AvatarShape", pkg["AvatarShape"]);
  /**
 * Different types of AvatarSize.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.AvatarSize
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents AvatarSize
 */
  pkg["AvatarSize"] = {
    /**
 * component size - 2rem
font size - 1rem
 * @public
 */
    "XS": "XS",
    /**
 * component size - 3rem
font size - 1.5rem
 * @public
 */
    "S": "S",
    /**
 * component size - 4rem
font size - 2rem
 * @public
 */
    "M": "M",
    /**
 * component size - 5rem
font size - 2.5rem
 * @public
 */
    "L": "L",
    /**
 * component size - 7rem
font size - 3rem
 * @public
 */
    "XL": "XL",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.AvatarSize", pkg["AvatarSize"]);
  /**
 * Defines background designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.BackgroundDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents BackgroundDesign
 */
  pkg["BackgroundDesign"] = {
    /**
 * A solid background color dependent on the theme.
 * @public
 */
    "Solid": "Solid",
    /**
 * Transparent background.
 * @public
 */
    "Transparent": "Transparent",
    /**
 * A translucent background depending on the opacity value of the theme.
 * @public
 */
    "Translucent": "Translucent",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BackgroundDesign", pkg["BackgroundDesign"]);
  /**
 * Different types of Bar design
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.BarDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents BarDesign
 */
  pkg["BarDesign"] = {
    /**
 * Default type
 * @public
 */
    "Header": "Header",
    /**
 * Subheader type
 * @public
 */
    "Subheader": "Subheader",
    /**
 * Footer type
 * @public
 */
    "Footer": "Footer",
    /**
 * Floating Footer type - there is visible border on all sides
 * @public
 */
    "FloatingFooter": "FloatingFooter",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BarDesign", pkg["BarDesign"]);
  /**
 * Defines border designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.BorderDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents BorderDesign
 */
  pkg["BorderDesign"] = {
    /**
 * A solid border color dependent on the theme.
 * @public
 */
    "Solid": "Solid",
    /**
 * Specifies no border.
 * @public
 */
    "None": "None",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BorderDesign", pkg["BorderDesign"]);
  /**
 * Different  Breadcrumbs designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.BreadcrumbsDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents BreadcrumbsDesign
 */
  pkg["BreadcrumbsDesign"] = {
    /**
 * Shows the current page as the last item in the trail.
The last item contains only plain text and is not a link.
 * @public
 */
    "Standard": "Standard",
    /**
 * All items are displayed as links.
 * @public
 */
    "NoCurrentPage": "NoCurrentPage",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BreadcrumbsDesign", pkg["BreadcrumbsDesign"]);
  /**
 * Different Breadcrumbs separators.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.BreadcrumbsSeparator
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents BreadcrumbsSeparator
 */
  pkg["BreadcrumbsSeparator"] = {
    /**
 * The separator appears as &quot;/&quot;.
 * @public
 */
    "Slash": "Slash",
    /**
 * The separator appears as &quot;\&quot;.
 * @public
 */
    "BackSlash": "BackSlash",
    /**
 * The separator appears as &quot;\\&quot;.
 * @public
 */
    "DoubleBackSlash": "DoubleBackSlash",
    /**
 * The separator appears as &quot;&gt;&gt;&quot;.
 * @public
 */
    "DoubleGreaterThan": "DoubleGreaterThan",
    /**
 * The separator appears as &quot;//&quot; .
 * @public
 */
    "DoubleSlash": "DoubleSlash",
    /**
 * The separator appears as &quot;&gt;&quot;.
 * @public
 */
    "GreaterThan": "GreaterThan",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BreadcrumbsSeparator", pkg["BreadcrumbsSeparator"]);
  /**
 * Different BusyIndicator sizes.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.BusyIndicatorSize
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents BusyIndicatorSize
 */
  pkg["BusyIndicatorSize"] = {
    /**
 * small size
 * @public
 */
    "S": "S",
    /**
 * medium size
 * @public
 */
    "M": "M",
    /**
 * large size
 * @public
 */
    "L": "L",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BusyIndicatorSize", pkg["BusyIndicatorSize"]);
  /**
 * Different BusyIndicator text placements.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.BusyIndicatorTextPlacement
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents BusyIndicatorTextPlacement
 */
  pkg["BusyIndicatorTextPlacement"] = {
    /**
 * The text will be displayed on top of the busy indicator.
 * @public
 */
    "Top": "Top",
    /**
 * The text will be displayed at the bottom of the busy indicator.
 * @public
 */
    "Bottom": "Bottom",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.BusyIndicatorTextPlacement", pkg["BusyIndicatorTextPlacement"]);
  /**
 * Button accessible roles.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ButtonAccessibleRole
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ButtonAccessibleRole
 */
  pkg["ButtonAccessibleRole"] = {
    /**
 * Represents Default (button) ARIA role.
 * @public
 */
    "Button": "Button",
    /**
 * Represents the ARIA role &quot;link&quot;.
 * @public
 */
    "Link": "Link",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonAccessibleRole", pkg["ButtonAccessibleRole"]);
  /**
 * Determines where the badge will be placed and how it will be styled.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ButtonBadgeDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ButtonBadgeDesign
 */
  pkg["ButtonBadgeDesign"] = {
    /**
 * The badge is displayed after the text, inside the button.
 * @public
 */
    "InlineText": "InlineText",
    /**
 * The badge is displayed at the top-end corner of the button.

**Note:** According to design guidance, the OverlayText design mode is best used in cozy density to avoid potential visual issues in compact.
 * @public
 */
    "OverlayText": "OverlayText",
    /**
 * The badge is displayed as an attention dot.
 * @public
 */
    "AttentionDot": "AttentionDot",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonBadgeDesign", pkg["ButtonBadgeDesign"]);
  /**
 * Different Button designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ButtonDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ButtonDesign
 */
  pkg["ButtonDesign"] = {
    /**
 * default type (no special styling)
 * @public
 */
    "Default": "Default",
    /**
 * accept type (green button)
 * @public
 */
    "Positive": "Positive",
    /**
 * reject style (red button)
 * @public
 */
    "Negative": "Negative",
    /**
 * transparent type
 * @public
 */
    "Transparent": "Transparent",
    /**
 * emphasized type
 * @public
 */
    "Emphasized": "Emphasized",
    /**
 * attention type
 * @public
 */
    "Attention": "Attention",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonDesign", pkg["ButtonDesign"]);
  /**
 * Determines if the button has special form-related functionality.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ButtonType
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ButtonType
 */
  pkg["ButtonType"] = {
    /**
 * The button does not do anything special when inside a form
 * @public
 */
    "Button": "Button",
    /**
 * The button acts as a submit button (submits a form)
 * @public
 */
    "Submit": "Submit",
    /**
 * The button acts as a reset button (resets a form)
 * @public
 */
    "Reset": "Reset",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ButtonType", pkg["ButtonType"]);
  /**
 * Enum for calendar legend items' types.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.CalendarLegendItemType
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents CalendarLegendItemType
 */
  pkg["CalendarLegendItemType"] = {
    /**
 * Set when no type is set.
 * @public
 */
    "None": "None",
    /**
 * Represents the &quot;Working&quot; item in the calendar legend.
 * @public
 */
    "Working": "Working",
    /**
 * Represents the &quot;NonWorking&quot; item in the calendar legend.
 * @public
 */
    "NonWorking": "NonWorking",
    /**
 * Represents the &quot;Type01&quot; item in the calendar legend.
 * @public
 */
    "Type01": "Type01",
    /**
 * Represents the &quot;Type02&quot; item in the calendar legend.
 * @public
 */
    "Type02": "Type02",
    /**
 * Represents the &quot;Type03&quot; item in the calendar legend.
 * @public
 */
    "Type03": "Type03",
    /**
 * Represents the &quot;Type04&quot; item in the calendar legend.
 * @public
 */
    "Type04": "Type04",
    /**
 * Represents the &quot;Type05&quot; item in the calendar legend.
 * @public
 */
    "Type05": "Type05",
    /**
 * Represents the &quot;Type06&quot; item in the calendar legend.
 * @public
 */
    "Type06": "Type06",
    /**
 * Represents the &quot;Type07&quot; item in the calendar legend.
 * @public
 */
    "Type07": "Type07",
    /**
 * Represents the &quot;Type08&quot; item in the calendar legend.
 * @public
 */
    "Type08": "Type08",
    /**
 * Represents the &quot;Type09&quot; item in the calendar legend.
 * @public
 */
    "Type09": "Type09",
    /**
 * Represents the &quot;Type10&quot; item in the calendar legend.
 * @public
 */
    "Type10": "Type10",
    /**
 * Represents the &quot;Type11&quot; item in the calendar legend.
 * @public
 */
    "Type11": "Type11",
    /**
 * Represents the &quot;Type12&quot; item in the calendar legend.
 * @public
 */
    "Type12": "Type12",
    /**
 * Represents the &quot;Type13&quot; item in the calendar legend.
 * @public
 */
    "Type13": "Type13",
    /**
 * Represents the &quot;Type14&quot; item in the calendar legend.
 * @public
 */
    "Type14": "Type14",
    /**
 * Represents the &quot;Type15&quot; item in the calendar legend.
 * @public
 */
    "Type15": "Type15",
    /**
 * Represents the &quot;Type16&quot; item in the calendar legend.
 * @public
 */
    "Type16": "Type16",
    /**
 * Represents the &quot;Type17&quot; item in the calendar legend.
 * @public
 */
    "Type17": "Type17",
    /**
 * Represents the &quot;Type18&quot; item in the calendar legend.
 * @public
 */
    "Type18": "Type18",
    /**
 * Represents the &quot;Type19&quot; item in the calendar legend.
 * @public
 */
    "Type19": "Type19",
    /**
 * Represents the &quot;Type20&quot; item in the calendar legend.
 * @public
 */
    "Type20": "Type20",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CalendarLegendItemType", pkg["CalendarLegendItemType"]);
  /**
 * Different Calendar selection mode.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.CalendarSelectionMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents CalendarSelectionMode
 */
  pkg["CalendarSelectionMode"] = {
    /**
 * Only one date can be selected at a time
 * @public
 */
    "Single": "Single",
    /**
 * Several dates can be selected
 * @public
 */
    "Multiple": "Multiple",
    /**
 * A range defined by a start date and an end date can be selected
 * @public
 */
    "Range": "Range",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CalendarSelectionMode", pkg["CalendarSelectionMode"]);
  /**
 * The <code>CalendarWeekNumbering</code> enum defines how to calculate calendar weeks. Each
value defines:
- The first day of the week,
- The first week of the year.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.CalendarWeekNumbering
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents CalendarWeekNumbering
 */
  pkg["CalendarWeekNumbering"] = {
    /**
 * The default calendar week numbering:

The framework determines the week numbering scheme; currently it is derived from the
active format locale. Future versions of ui5-webcomponents might select a different week numbering
scheme.
 * @public
 */
    "Default": "Default",
    /**
 * Official calendar week numbering in most of Europe (ISO 8601 standard):
Monday is first day of the week, the week containing January 4th is first week of the year.
 * @public
 */
    "ISO_8601": "ISO_8601",
    /**
 * Official calendar week numbering in much of the Middle East (Middle Eastern calendar):
Saturday is first day of the week, the week containing January 1st is first week of the year.
 * @public
 */
    "MiddleEastern": "MiddleEastern",
    /**
 * Official calendar week numbering in the United States, Canada, Brazil, Israel, Japan, and
other countries (Western traditional calendar):
Sunday is first day of the week, the week containing January 1st is first week of the year.
 * @public
 */
    "WesternTraditional": "WesternTraditional",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CalendarWeekNumbering", pkg["CalendarWeekNumbering"]);
  /**
 * Different Carousel arrows placement.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.CarouselArrowsPlacement
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents CarouselArrowsPlacement
 */
  pkg["CarouselArrowsPlacement"] = {
    /**
 * Carousel arrows are placed on the sides of the current Carousel page.
 * @public
 */
    "Content": "Content",
    /**
 * Carousel arrows are placed on the sides of the page indicator of the Carousel.
 * @public
 */
    "Navigation": "Navigation",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CarouselArrowsPlacement", pkg["CarouselArrowsPlacement"]);
  /**
 * Different Carousel page indicator types.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.CarouselPageIndicatorType
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents CarouselPageIndicatorType
 */
  pkg["CarouselPageIndicatorType"] = {
    /**
 * The page indicator will be visualized as dots if there are fewer than 9 pages.
If there are more pages, the page indicator will switch to displaying the current page and the total number of pages. (e.g. X of Y)
 * @public
 */
    "Default": "Default",
    /**
 * The page indicator will display the current page and the total number of pages. (e.g. X of Y)
 * @public
 */
    "Numeric": "Numeric",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.CarouselPageIndicatorType", pkg["CarouselPageIndicatorType"]);
  /**
 * Different filtering types of the ComboBox.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ComboBoxFilter
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ComboBoxFilter
 */
  pkg["ComboBoxFilter"] = {
    /**
 * Defines filtering by first symbol of each word of item&#x27;s text.
 * @public
 */
    "StartsWithPerTerm": "StartsWithPerTerm",
    /**
 * Defines filtering by starting symbol of item&#x27;s text.
 * @public
 */
    "StartsWith": "StartsWith",
    /**
 * Defines contains filtering.
 * @public
 */
    "Contains": "Contains",
    /**
 * Removes any filtering applied while typing
 * @public
 */
    "None": "None",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ComboBoxFilter", pkg["ComboBoxFilter"]);
  /**
 * Overflow Mode.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ExpandableTextOverflowMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ExpandableTextOverflowMode
 */
  pkg["ExpandableTextOverflowMode"] = {
    /**
 * Overflowing text is appended in-place.
 * @public
 */
    "InPlace": "InPlace",
    /**
 * Full text is displayed in a popover.
 * @public
 */
    "Popover": "Popover",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ExpandableTextOverflowMode", pkg["ExpandableTextOverflowMode"]);
  /**
 * Different Button designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.FormItemSpacing
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents FormItemSpacing
 */
  pkg["FormItemSpacing"] = {
    /**
 * Normal spacing (smaller vertical space between form items).
 * @public
 */
    "Normal": "Normal",
    /**
 * Large spacing (larger vertical space between form items).
 * @public
 */
    "Large": "Large",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.FormItemSpacing", pkg["FormItemSpacing"]);
  /**
 * Different types of Highlight .
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.Highlight
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents Highlight
 */
  pkg["Highlight"] = {
    /**
 * 
 * @public
 */
    "None": "None",
    /**
 * 
 * @public
 */
    "Positive": "Positive",
    /**
 * 
 * @public
 */
    "Critical": "Critical",
    /**
 * 
 * @public
 */
    "Negative": "Negative",
    /**
 * 
 * @public
 */
    "Information": "Information",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.Highlight", pkg["Highlight"]);
  /**
 * Different Icon semantic designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IconDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IconDesign
 */
  pkg["IconDesign"] = {
    /**
 * Contrast design
 * @public
 */
    "Contrast": "Contrast",
    /**
 * Critical design
 * @public
 */
    "Critical": "Critical",
    /**
 * Default design (brand design)
 * @public
 */
    "Default": "Default",
    /**
 * info type
 * @public
 */
    "Information": "Information",
    /**
 * Negative design
 * @public
 */
    "Negative": "Negative",
    /**
 * Neutral design
 * @public
 */
    "Neutral": "Neutral",
    /**
 * Design that indicates an icon which isn&#x27;t interactive
 * @public
 */
    "NonInteractive": "NonInteractive",
    /**
 * Positive design
 * @public
 */
    "Positive": "Positive",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IconDesign", pkg["IconDesign"]);
  /**
 * Different Icon modes.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IconMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IconMode
 */
  pkg["IconMode"] = {
    /**
 * Image mode (by default).
Configures the component to internally render role&#x3D;&quot;img&quot;.
 * @public
 */
    "Image": "Image",
    /**
 * Decorative mode.
Configures the component to internally render role&#x3D;&quot;presentation&quot; and aria-hidden&#x3D;&quot;true&quot;,
making it purely decorative without semantic content or interactivity.
 * @public
 */
    "Decorative": "Decorative",
    /**
 * Interactive mode.
Configures the component to internally render role&#x3D;&quot;button&quot;.
This mode also supports focus and press handling to enhance interactivity.
 * @public
 */
    "Interactive": "Interactive",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.IconMode", pkg["IconMode"]);
  /**
 * Different input types.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.InputType
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents InputType
 */
  pkg["InputType"] = {
    /**
 * Defines a one-line text input field:
 * @public
 */
    "Text": "Text",
    /**
 * Used for input fields that must contain an e-mail address.
 * @public
 */
    "Email": "Email",
    /**
 * Defines a numeric input field.
 * @public
 */
    "Number": "Number",
    /**
 * Defines a password field.
 * @public
 */
    "Password": "Password",
    /**
 * Used for input fields that should contain a telephone number.
 * @public
 */
    "Tel": "Tel",
    /**
 * Used for input fields that should contain a URL address.
 * @public
 */
    "URL": "URL",
    /**
 * Used for input fields that should contain a search term.
 * @public
 */
    "Search": "Search",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.InputType", pkg["InputType"]);
  /**
 * Defines the area size around the component that the user can select.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.InteractiveAreaSize
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents InteractiveAreaSize
 */
  pkg["InteractiveAreaSize"] = {
    /**
 * The default target area size (the area taken by the component itself without any extra invisible touch area).
 * @public
 */
    "Normal": "Normal",
    /**
 * Enlarged target area size (up to 24px in height) provides users with an enhanced dedicated space to interact with the component.
 * @public
 */
    "Large": "Large",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.InteractiveAreaSize", pkg["InteractiveAreaSize"]);
  /**
 * Link accessible roles.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.LinkAccessibleRole
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents LinkAccessibleRole
 */
  pkg["LinkAccessibleRole"] = {
    /**
 * Represents Default (link) ARIA role.
 * @public
 */
    "Link": "Link",
    /**
 * Represents the ARIA role &quot;button&quot;.
 * @public
 */
    "Button": "Button",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.LinkAccessibleRole", pkg["LinkAccessibleRole"]);
  /**
 * Different link designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.LinkDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents LinkDesign
 */
  pkg["LinkDesign"] = {
    /**
 * default type (no special styling)
 * @public
 */
    "Default": "Default",
    /**
 * subtle type (appears as regular text, rather than a link)
 * @public
 */
    "Subtle": "Subtle",
    /**
 * emphasized type
 * @public
 */
    "Emphasized": "Emphasized",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.LinkDesign", pkg["LinkDesign"]);
  /**
 * List accessible roles.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ListAccessibleRole
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ListAccessibleRole
 */
  pkg["ListAccessibleRole"] = {
    /**
 * Represents the ARIA role &quot;list&quot;. (by default)
 * @public
 */
    "List": "List",
    /**
 * Represents the ARIA role &quot;menu&quot;.
 * @public
 */
    "Menu": "Menu",
    /**
 * Represents the ARIA role &quot;tree&quot;.
 * @public
 */
    "Tree": "Tree",
    /**
 * Represents the ARIA role &quot;listbox&quot;.
 * @public
 */
    "ListBox": "ListBox",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListAccessibleRole", pkg["ListAccessibleRole"]);
  /**
 * Different list growing modes.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ListGrowingMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ListGrowingMode
 */
  pkg["ListGrowingMode"] = {
    /**
 * Component&#x27;s &quot;load-more&quot; is fired upon pressing a &quot;More&quot; button.
at the bottom.
 * @public
 */
    "Button": "Button",
    /**
 * Component&#x27;s &quot;load-more&quot; is fired upon scroll.
 * @public
 */
    "Scroll": "Scroll",
    /**
 * Component&#x27;s growing is not enabled.
 * @public
 */
    "None": "None",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListGrowingMode", pkg["ListGrowingMode"]);
  /**
 * ListItem accessible roles.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ListItemAccessibleRole
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ListItemAccessibleRole
 */
  pkg["ListItemAccessibleRole"] = {
    /**
 * Represents the ARIA role &quot;listitem&quot;. (by default)
 * @public
 */
    "ListItem": "ListItem",
    /**
 * Represents the ARIA role &quot;menuitem&quot;.
 * @public
 */
    "MenuItem": "MenuItem",
    /**
 * Represents the ARIA role &quot;treeitem&quot;.
 * @public
 */
    "TreeItem": "TreeItem",
    /**
 * Represents the ARIA role &quot;option&quot;.
 * @public
 */
    "Option": "Option",
    /**
 * Represents the ARIA role &quot;none&quot;.
 * @public
 */
    "None": "None",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListItemAccessibleRole", pkg["ListItemAccessibleRole"]);
  /**
 * Different list item types.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ListItemType
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ListItemType
 */
  pkg["ListItemType"] = {
    /**
 * Indicates the list item does not have any active feedback when item is pressed.
 * @public
 */
    "Inactive": "Inactive",
    /**
 * Indicates that the item is clickable via active feedback when item is pressed.
 * @public
 */
    "Active": "Active",
    /**
 * Enables detail button of the list item that fires detail-click event.
 * @public
 */
    "Detail": "Detail",
    /**
 * Enables the type of navigation, which is specified to add an arrow at the end of the items and fires navigate-click event.
 * @public
 */
    "Navigation": "Navigation",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListItemType", pkg["ListItemType"]);
  /**
 * Different list selection modes.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ListSelectionMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ListSelectionMode
 */
  pkg["ListSelectionMode"] = {
    /**
 * Default mode (no selection).
 * @public
 */
    "None": "None",
    /**
 * Right-positioned single selection mode (only one list item can be selected).
 * @public
 */
    "Single": "Single",
    /**
 * Left-positioned single selection mode (only one list item can be selected).
 * @public
 */
    "SingleStart": "SingleStart",
    /**
 * Selected item is highlighted but no selection element is visible
(only one list item can be selected).
 * @public
 */
    "SingleEnd": "SingleEnd",
    /**
 * Selected item is highlighted and selection is changed upon arrow navigation
(only one list item can be selected - this is always the focused item).
 * @public
 */
    "SingleAuto": "SingleAuto",
    /**
 * Multi selection mode (more than one list item can be selected).
 * @public
 */
    "Multiple": "Multiple",
    /**
 * Delete mode (only one list item can be deleted via provided delete button)
 * @public
 */
    "Delete": "Delete",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListSelectionMode", pkg["ListSelectionMode"]);
  /**
 * Different types of list items separators.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ListSeparator
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ListSeparator
 */
  pkg["ListSeparator"] = {
    /**
 * Separators between the items including the last and the first one.
 * @public
 */
    "All": "All",
    /**
 * Separators between the items.
Note: This enumeration depends on the theme.
 * @public
 */
    "Inner": "Inner",
    /**
 * No item separators.
 * @public
 */
    "None": "None",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ListSeparator", pkg["ListSeparator"]);
  /**
 * MessageStrip designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.MessageStripDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents MessageStripDesign
 */
  pkg["MessageStripDesign"] = {
    /**
 * Message should be just an information
 * @public
 */
    "Information": "Information",
    /**
 * Message is a success message
 * @public
 */
    "Positive": "Positive",
    /**
 * Message is an error
 * @public
 */
    "Negative": "Negative",
    /**
 * Message is a warning
 * @public
 */
    "Critical": "Critical",
    /**
 * Message uses custom color set 1
 * @public
 */
    "ColorSet1": "ColorSet1",
    /**
 * Message uses custom color set 2
 * @public
 */
    "ColorSet2": "ColorSet2",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.MessageStripDesign", pkg["MessageStripDesign"]);
  /**
 * Different notification list growing modes.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.NotificationListGrowingMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents NotificationListGrowingMode
 */
  pkg["NotificationListGrowingMode"] = {
    /**
 * Component&#x27;s &quot;load-more&quot; is fired upon pressing a &quot;More&quot; button.
at the bottom.
 * @public
 */
    "Button": "Button",
    /**
 * Component&#x27;s growing is not enabled.
 * @public
 */
    "None": "None",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.NotificationListGrowingMode", pkg["NotificationListGrowingMode"]);
  /**
 * Tabs overflow mode in TabContainer.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.OverflowMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents OverflowMode
 */
  pkg["OverflowMode"] = {
    /**
 * End type is used if there should be only one overflow with hidden the tabs at the end of the tab container.
 * @public
 */
    "End": "End",
    /**
 * StartAndEnd type is used if there should be two overflows on both ends of the tab container.
 * @public
 */
    "StartAndEnd": "StartAndEnd",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.OverflowMode", pkg["OverflowMode"]);
  /**
 * Panel accessible roles.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.PanelAccessibleRole
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents PanelAccessibleRole
 */
  pkg["PanelAccessibleRole"] = {
    /**
 * Represents the ARIA role &quot;complementary&quot;.
A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
 * @public
 */
    "Complementary": "Complementary",
    /**
 * Represents the ARIA role &quot;Form&quot;.
A landmark region that contains a collection of items and objects that, as a whole, create a form.
 * @public
 */
    "Form": "Form",
    /**
 * Represents the ARIA role &quot;Region&quot;.
A section of a page, that is important enough to be included in a page summary or table of contents.
 * @public
 */
    "Region": "Region",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PanelAccessibleRole", pkg["PanelAccessibleRole"]);
  /**
 * Popover horizontal align types.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.PopoverHorizontalAlign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents PopoverHorizontalAlign
 */
  pkg["PopoverHorizontalAlign"] = {
    /**
 * Popover is centered.
 * @public
 */
    "Center": "Center",
    /**
 * Popover is aligned with the start of the target.
 * @public
 */
    "Start": "Start",
    /**
 * Popover is aligned with the end of the target.
 * @public
 */
    "End": "End",
    /**
 * Popover is stretched.
 * @public
 */
    "Stretch": "Stretch",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PopoverHorizontalAlign", pkg["PopoverHorizontalAlign"]);
  /**
 * Popover placements.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.PopoverPlacement
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents PopoverPlacement
 */
  pkg["PopoverPlacement"] = {
    /**
 * Popover will be placed at the start of the reference element.
 * @public
 */
    "Start": "Start",
    /**
 * Popover will be placed at the end of the reference element.
 * @public
 */
    "End": "End",
    /**
 * Popover will be placed at the top of the reference element.
 * @public
 */
    "Top": "Top",
    /**
 * Popover will be placed at the bottom of the reference element.
 * @public
 */
    "Bottom": "Bottom",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PopoverPlacement", pkg["PopoverPlacement"]);
  /**
 * Popover vertical align types.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.PopoverVerticalAlign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents PopoverVerticalAlign
 */
  pkg["PopoverVerticalAlign"] = {
    /**
 * 
 * @public
 */
    "Center": "Center",
    /**
 * Popover will be placed at the top of the reference control.
 * @public
 */
    "Top": "Top",
    /**
 * Popover will be placed at the bottom of the reference control.
 * @public
 */
    "Bottom": "Bottom",
    /**
 * Popover will be streched
 * @public
 */
    "Stretch": "Stretch",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PopoverVerticalAlign", pkg["PopoverVerticalAlign"]);
  /**
 * Popup accessible roles.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.PopupAccessibleRole
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents PopupAccessibleRole
 */
  pkg["PopupAccessibleRole"] = {
    /**
 * Represents no ARIA role.
 * @public
 */
    "None": "None",
    /**
 * Represents the ARIA role &quot;dialog&quot;.
 * @public
 */
    "Dialog": "Dialog",
    /**
 * Represents the ARIA role &quot;alertdialog&quot;.
 * @public
 */
    "AlertDialog": "AlertDialog",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.PopupAccessibleRole", pkg["PopupAccessibleRole"]);
  /**
 * Different types of Priority.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.Priority
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents Priority
 */
  pkg["Priority"] = {
    /**
 * High priority.
 * @public
 */
    "High": "High",
    /**
 * Medium priority.
 * @public
 */
    "Medium": "Medium",
    /**
 * Low priority.
 * @public
 */
    "Low": "Low",
    /**
 * Default, none priority.
 * @public
 */
    "None": "None",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.Priority", pkg["Priority"]);
  /**
 * Types of icon sizes used in the RatingIndicator.
Provides predefined size categories to ensure consistent scaling and spacing of icons.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.RatingIndicatorSize
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents RatingIndicatorSize
 */
  pkg["RatingIndicatorSize"] = {
    /**
 * Small size for compact layouts.
 * @public
 */
    "S": "S",
    /**
 * Medium size, used as the default option.
Offers a balanced appearance for most scenarios.
 * @public
 */
    "M": "M",
    /**
 * Large size for prominent or spacious layouts.
 * @public
 */
    "L": "L",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.RatingIndicatorSize", pkg["RatingIndicatorSize"]);
  /**
 * Different SegmentedButton selection modes.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.SegmentedButtonSelectionMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents SegmentedButtonSelectionMode
 */
  pkg["SegmentedButtonSelectionMode"] = {
    /**
 * There is always one selected. Selecting one deselects the previous one.
 * @public
 */
    "Single": "Single",
    /**
 * Multiple items can be selected at a time. All items can be deselected.
 * @public
 */
    "Multiple": "Multiple",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.SegmentedButtonSelectionMode", pkg["SegmentedButtonSelectionMode"]);
  /**
 * Different types of SemanticColor.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.SemanticColor
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents SemanticColor
 */
  pkg["SemanticColor"] = {
    /**
 * Default color (brand color)
 * @public
 */
    "Default": "Default",
    /**
 * Positive color
 * @public
 */
    "Positive": "Positive",
    /**
 * Negative color
 * @public
 */
    "Negative": "Negative",
    /**
 * Critical color
 * @public
 */
    "Critical": "Critical",
    /**
 * Neutral color.
 * @public
 */
    "Neutral": "Neutral",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.SemanticColor", pkg["SemanticColor"]);
  /**
 * Different types of Switch designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.SwitchDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents SwitchDesign
 */
  pkg["SwitchDesign"] = {
    /**
 * Defines the Switch as Textual
 * @public
 */
    "Textual": "Textual",
    /**
 * Defines the Switch as Graphical
 * @public
 */
    "Graphical": "Graphical",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.SwitchDesign", pkg["SwitchDesign"]);
  /**
 * Tab layout of TabContainer.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.TabLayout
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents TabLayout
 */
  pkg["TabLayout"] = {
    /**
 * Inline type, the tab &quot;main text&quot; and &quot;additionalText&quot; are displayed horizotally.
 * @public
 */
    "Inline": "Inline",
    /**
 * Standard type, the tab &quot;main text&quot; and &quot;additionalText&quot; are displayed vertically.
 * @public
 */
    "Standard": "Standard",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TabLayout", pkg["TabLayout"]);
  /**
 * Alignment of the &lt;ui5-table-cell&gt; component.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.TableCellHorizontalAlign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents TableCellHorizontalAlign
 */
  pkg["TableCellHorizontalAlign"] = {
    /**
 * 
 * @public
 */
    "Left": "Left",
    /**
 * 
 * @public
 */
    "Start": "Start",
    /**
 * 
 * @public
 */
    "Right": "Right",
    /**
 * 
 * @public
 */
    "End": "End",
    /**
 * 
 * @public
 */
    "Center": "Center",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TableCellHorizontalAlign", pkg["TableCellHorizontalAlign"]);
  /**
 * Growing mode of the &lt;ui5-table&gt; component.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.TableGrowingMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents TableGrowingMode
 */
  pkg["TableGrowingMode"] = {
    /**
 * Renders a growing button, which can be pressed to load more data.
 * @public
 */
    "Button": "Button",
    /**
 * Scroll to load more data.

**Note:** If the table is not scrollable, a growing button will be rendered instead to ensure growing functionality.
 * @public
 */
    "Scroll": "Scroll",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TableGrowingMode", pkg["TableGrowingMode"]);
  /**
 * Column mode of the &lt;ui5-table&gt; component.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.TableOverflowMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents TableOverflowMode
 */
  pkg["TableOverflowMode"] = {
    /**
 * Shows a scrollbar, when the table cannot fit all columns.
 * @public
 */
    "Scroll": "Scroll",
    /**
 * Pops in columns, that do not fit into the table anymore.
 * @public
 */
    "Popin": "Popin",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TableOverflowMode", pkg["TableOverflowMode"]);
  /**
 * Selection modes of the &lt;ui5-table&gt; component.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.TableSelectionMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents TableSelectionMode
 */
  pkg["TableSelectionMode"] = {
    /**
 * Default mode (no selection).
 * @public
 */
    "None": "None",
    /**
 * Single selection mode (only one table row can be selected).
 * @public
 */
    "Single": "Single",
    /**
 * Multi selection mode (more than one table row can be selected).
 * @public
 */
    "Multiple": "Multiple",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TableSelectionMode", pkg["TableSelectionMode"]);
  /**
 * Defines tag design types.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.TagDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents TagDesign
 */
  pkg["TagDesign"] = {
    /**
 * Set1 of generic indication colors that are intended for industry-specific use cases
 * @public
 */
    "Set1": "Set1",
    /**
 * Set2 of generic indication colors that are intended for industry-specific use cases
 * @public
 */
    "Set2": "Set2",
    /**
 * Neutral design
 * @public
 */
    "Neutral": "Neutral",
    /**
 * Information design
 * @public
 */
    "Information": "Information",
    /**
 * Positive design
 * @public
 */
    "Positive": "Positive",
    /**
 * Negative design
 * @public
 */
    "Negative": "Negative",
    /**
 * Critical design
 * @public
 */
    "Critical": "Critical",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TagDesign", pkg["TagDesign"]);
  /**
 * Predefined sizes for the tag.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.TagSize
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents TagSize
 */
  pkg["TagSize"] = {
    /**
 * Small size of the tag
 * @public
 */
    "S": "S",
    /**
 * Large size of the tag
 * @public
 */
    "L": "L",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TagSize", pkg["TagSize"]);
  /**
 * Empty Indicator Mode.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.TextEmptyIndicatorMode
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents TextEmptyIndicatorMode
 */
  pkg["TextEmptyIndicatorMode"] = {
    /**
 * Empty indicator is never rendered.
 * @public
 */
    "Off": "Off",
    /**
 * Empty indicator is rendered always when the component&#x27;s content is empty.
 * @public
 */
    "On": "On",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TextEmptyIndicatorMode", pkg["TextEmptyIndicatorMode"]);
  /**
 * Different types of Title level.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.TitleLevel
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents TitleLevel
 */
  pkg["TitleLevel"] = {
    /**
 * Renders &#x60;h1&#x60; tag.
 * @public
 */
    "H1": "H1",
    /**
 * Renders &#x60;h2&#x60; tag.
 * @public
 */
    "H2": "H2",
    /**
 * Renders &#x60;h3&#x60; tag.
 * @public
 */
    "H3": "H3",
    /**
 * Renders &#x60;h4&#x60; tag.
 * @public
 */
    "H4": "H4",
    /**
 * Renders &#x60;h5&#x60; tag.
 * @public
 */
    "H5": "H5",
    /**
 * Renders &#x60;h6&#x60; tag.
 * @public
 */
    "H6": "H6",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.TitleLevel", pkg["TitleLevel"]);
  /**
 * Toast placement.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ToastPlacement
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ToastPlacement
 */
  pkg["ToastPlacement"] = {
    /**
 * Toast is placed at the &#x60;TopStart&#x60; position of its container.
 * @public
 */
    "TopStart": "TopStart",
    /**
 * Toast is placed at the &#x60;TopCenter&#x60; position of its container.
 * @public
 */
    "TopCenter": "TopCenter",
    /**
 * Toast is placed at the &#x60;TopEnd&#x60; position of its container.
 * @public
 */
    "TopEnd": "TopEnd",
    /**
 * Toast is placed at the &#x60;MiddleStart&#x60; position of its container.
 * @public
 */
    "MiddleStart": "MiddleStart",
    /**
 * Toast is placed at the &#x60;MiddleCenter&#x60; position of its container.
 * @public
 */
    "MiddleCenter": "MiddleCenter",
    /**
 * Toast is placed at the &#x60;MiddleEnd&#x60; position of its container.
 * @public
 */
    "MiddleEnd": "MiddleEnd",
    /**
 * Toast is placed at the &#x60;BottomStart&#x60; position of its container.
 * @public
 */
    "BottomStart": "BottomStart",
    /**
 * Toast is placed at the &#x60;BottomCenter&#x60; position of its container.
Default placement (no selection)
 * @public
 */
    "BottomCenter": "BottomCenter",
    /**
 * Toast is placed at the &#x60;BottomEnd&#x60; position of its container.
 * @public
 */
    "BottomEnd": "BottomEnd",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ToastPlacement", pkg["ToastPlacement"]);
  /**
 * Defines which direction the items of ui5-toolbar will be aligned.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ToolbarAlign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ToolbarAlign
 */
  pkg["ToolbarAlign"] = {
    /**
 * Toolbar items are situated at the &#x60;start&#x60; of the Toolbar
 * @public
 */
    "Start": "Start",
    /**
 * Toolbar items are situated at the &#x60;end&#x60; of the Toolbar
 * @public
 */
    "End": "End",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ToolbarAlign", pkg["ToolbarAlign"]);
  /**
 * Defines the available toolbar designs.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ToolbarDesign
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ToolbarDesign
 */
  pkg["ToolbarDesign"] = {
    /**
 * The toolbar and its content will be displayed with solid background.
 * @public
 */
    "Solid": "Solid",
    /**
 * The toolbar and its content will be displayed with transparent background.
 * @public
 */
    "Transparent": "Transparent",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ToolbarDesign", pkg["ToolbarDesign"]);
  /**
 * Defines the priority of the toolbar item to go inside overflow popover.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ToolbarItemOverflowBehavior
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ToolbarItemOverflowBehavior
 */
  pkg["ToolbarItemOverflowBehavior"] = {
    /**
 * The item is presented inside the toolbar and goes in the popover, when there is not enough space.
 * @public
 */
    "Default": "Default",
    /**
 * When set, the item will never go to the overflow popover.
 * @public
 */
    "NeverOverflow": "NeverOverflow",
    /**
 * When set, the item will be always part of the overflow part of ui5-toolbar.
 * @public
 */
    "AlwaysOverflow": "AlwaysOverflow",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.ToolbarItemOverflowBehavior", pkg["ToolbarItemOverflowBehavior"]);
  /**
 * Different types of wrapping.
 * @enum {string}
 * @public
 * @alias ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.WrappingType
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents WrappingType
 */
  pkg["WrappingType"] = {
    /**
 * The text will be truncated with an ellipsis.
 * @public
 */
    "None": "None",
    /**
 * The text will wrap. The words will not be broken based on hyphenation.
 * @public
 */
    "Normal": "Normal",
  };
  registerEnum("ui5.ecosystem.demo.app.thirdparty.@ui5.webcomponents.WrappingType", pkg["WrappingType"]);

  // Interfaces
  /**
 * Interface for components that represent an avatar and may be slotted in numerous higher-order components such as `ui5-avatar-group`
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IAvatarGroupItem
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IAvatarGroupItem
 * @interface
 * @public
 */
  /**
 * Interface for components that may be used as a button inside numerous higher-order components
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IButton
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IButton
 * @interface
 * @public
 */
  /**
 * Interface for components that may be slotted inside a `ui5-calendar`.

**Note:** Use with `ui5-date` or `ui5-date-range` as calendar date selection types.
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ICalendarSelectedDates
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ICalendarSelectedDates
 * @interface
 * @public
 */
  /**
 * Interface for components that may be used inside a `ui5-color-palette` or `ui5-color-palette-popover`
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IColorPaletteItem
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IColorPaletteItem
 * @interface
 * @public
 */
  /**
 * Interface for components that may be slotted inside a `ui5-combobox`
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IComboBoxItem
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IComboBoxItem
 * @interface
 * @public
 */
  /**
 * Interface for components that can be slotted inside `ui5-form` as items.
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IFormItem
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IFormItem
 * @interface
 * @public
 */
  /**
 * Interface for components that represent an icon, usable in numerous higher-order components
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IIcon
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IIcon
 * @interface
 * @public
 */
  /**
 * Interface for components that represent a suggestion item, usable in `ui5-input`
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IInputSuggestionItem
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IInputSuggestionItem
 * @interface
 * @public
 */
  /**
 * Interface for components that may be slotted inside a `ui5-menu`.

**Note:** Use with `ui5-menu-item` or `ui5-menu-separator`. Implementing the interface does not guarantee that any other classes can work with the `ui5-menu`.
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IMenuItem
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IMenuItem
 * @interface
 * @public
 */
  /**
 * Interface for components that may be slotted inside a `ui5-multi-combobox` as items
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IMultiComboBoxItem
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IMultiComboBoxItem
 * @interface
 * @public
 */
  /**
 * Interface for components that may be slotted inside `ui5-segmented-button` as items
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ISegmentedButtonItem
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ISegmentedButtonItem
 * @interface
 * @public
 */
  /**
 * Interface for components that may be slotted inside `ui5-select` as options
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.IOption
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents IOption
 * @interface
 * @public
 */
  /**
 * Interface for components that may be slotted inside `ui5-tabcontainer` as items

**Note:** Use directly `ui5-tab` or `ui5-tab-seprator`. Implementing the interface does not guarantee that the class can work as a tab.
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ITab
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ITab
 * @interface
 * @public
 */
  /**
 * Interface for components that can be slotted inside the `features` slot of the `ui5-table`.
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ITableFeature
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ITableFeature
 * @interface
 * @public
 */
  /**
 * Interface for components that can be slotted inside the `features` slot of the `ui5-table`
and provide growing/data loading functionality.
 * @name ui5.ecosystem.demo.app.thirdparty."@ui5".webcomponents.ITableGrowing
 * @ui5-module-override ui5/ecosystem/demo/app/thirdparty/@ui5/webcomponents ITableGrowing
 * @interface
 * @public
 */


	return pkg;
});
