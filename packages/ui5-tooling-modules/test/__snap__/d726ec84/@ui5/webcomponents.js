/*!
 * ${copyright}
 */
sap.ui.define([
  "sap/ui/base/DataType",
  "ui5/ecosystem/demo/app/resources/@ui5/webcomponents-base",
], function(
  DataType,
) {
  "use strict";
  const { registerEnum } = DataType;

  const pkg = {
    "_ui5metadata":
{
  "name": "@ui5/webcomponents",
  "version": "2.7.0",
  "dependencies": [
    "sap.ui.core"
  ],
  "types": [
    "@ui5/webcomponents.AvatarColorScheme",
    "@ui5/webcomponents.AvatarGroupType",
    "@ui5/webcomponents.AvatarShape",
    "@ui5/webcomponents.AvatarSize",
    "@ui5/webcomponents.BackgroundDesign",
    "@ui5/webcomponents.BarDesign",
    "@ui5/webcomponents.BorderDesign",
    "@ui5/webcomponents.BreadcrumbsDesign",
    "@ui5/webcomponents.BreadcrumbsSeparator",
    "@ui5/webcomponents.BusyIndicatorSize",
    "@ui5/webcomponents.BusyIndicatorTextPlacement",
    "@ui5/webcomponents.ButtonAccessibleRole",
    "@ui5/webcomponents.ButtonBadgeDesign",
    "@ui5/webcomponents.ButtonDesign",
    "@ui5/webcomponents.ButtonType",
    "@ui5/webcomponents.CalendarLegendItemType",
    "@ui5/webcomponents.CalendarSelectionMode",
    "@ui5/webcomponents.CalendarWeekNumbering",
    "@ui5/webcomponents.CarouselArrowsPlacement",
    "@ui5/webcomponents.CarouselPageIndicatorType",
    "@ui5/webcomponents.ComboBoxFilter",
    "@ui5/webcomponents.ExpandableTextOverflowMode",
    "@ui5/webcomponents.FormItemSpacing",
    "@ui5/webcomponents.Highlight",
    "@ui5/webcomponents.IconDesign",
    "@ui5/webcomponents.IconMode",
    "@ui5/webcomponents.InputType",
    "@ui5/webcomponents.LinkAccessibleRole",
    "@ui5/webcomponents.LinkDesign",
    "@ui5/webcomponents.ListAccessibleRole",
    "@ui5/webcomponents.ListGrowingMode",
    "@ui5/webcomponents.ListItemAccessibleRole",
    "@ui5/webcomponents.ListItemType",
    "@ui5/webcomponents.ListSelectionMode",
    "@ui5/webcomponents.ListSeparator",
    "@ui5/webcomponents.MessageStripDesign",
    "@ui5/webcomponents.NotificationListGrowingMode",
    "@ui5/webcomponents.OverflowMode",
    "@ui5/webcomponents.PanelAccessibleRole",
    "@ui5/webcomponents.PopoverHorizontalAlign",
    "@ui5/webcomponents.PopoverPlacement",
    "@ui5/webcomponents.PopoverVerticalAlign",
    "@ui5/webcomponents.PopupAccessibleRole",
    "@ui5/webcomponents.Priority",
    "@ui5/webcomponents.RatingIndicatorSize",
    "@ui5/webcomponents.SegmentedButtonSelectionMode",
    "@ui5/webcomponents.SemanticColor",
    "@ui5/webcomponents.SwitchDesign",
    "@ui5/webcomponents.TabLayout",
    "@ui5/webcomponents.TableCellHorizontalAlign",
    "@ui5/webcomponents.TableGrowingMode",
    "@ui5/webcomponents.TableOverflowMode",
    "@ui5/webcomponents.TableSelectionMode",
    "@ui5/webcomponents.TagDesign",
    "@ui5/webcomponents.TagSize",
    "@ui5/webcomponents.TextEmptyIndicatorMode",
    "@ui5/webcomponents.TitleLevel",
    "@ui5/webcomponents.ToastPlacement",
    "@ui5/webcomponents.ToolbarAlign",
    "@ui5/webcomponents.ToolbarDesign",
    "@ui5/webcomponents.ToolbarItemOverflowBehavior",
    "@ui5/webcomponents.WrappingType"
  ],
  "interfaces": [],
  "controls": [
    "@ui5/webcomponents.Avatar",
    "@ui5/webcomponents.AvatarGroup",
    "@ui5/webcomponents.Bar",
    "@ui5/webcomponents.Breadcrumbs",
    "@ui5/webcomponents.BreadcrumbsItem",
    "@ui5/webcomponents.BusyIndicator",
    "@ui5/webcomponents.Button",
    "@ui5/webcomponents.ButtonBadge",
    "@ui5/webcomponents.Calendar",
    "@ui5/webcomponents.CalendarDate",
    "@ui5/webcomponents.CalendarDateRange",
    "@ui5/webcomponents.CalendarLegend",
    "@ui5/webcomponents.CalendarLegendItem",
    "@ui5/webcomponents.Card",
    "@ui5/webcomponents.CardHeader",
    "@ui5/webcomponents.Carousel",
    "@ui5/webcomponents.CheckBox",
    "@ui5/webcomponents.ColorPalette",
    "@ui5/webcomponents.ColorPaletteItem",
    "@ui5/webcomponents.ColorPalettePopover",
    "@ui5/webcomponents.ColorPicker",
    "@ui5/webcomponents.ComboBox",
    "@ui5/webcomponents.ComboBoxItem",
    "@ui5/webcomponents.ComboBoxItemGroup",
    "@ui5/webcomponents.DatePicker",
    "@ui5/webcomponents.DateRangePicker",
    "@ui5/webcomponents.DateTimePicker",
    "@ui5/webcomponents.Dialog",
    "@ui5/webcomponents.ExpandableText",
    "@ui5/webcomponents.FileUploader",
    "@ui5/webcomponents.Form",
    "@ui5/webcomponents.FormGroup",
    "@ui5/webcomponents.FormItem",
    "@ui5/webcomponents.Icon",
    "@ui5/webcomponents.Input",
    "@ui5/webcomponents.Label",
    "@ui5/webcomponents.Link",
    "@ui5/webcomponents.List",
    "@ui5/webcomponents.ListItemCustom",
    "@ui5/webcomponents.ListItemGroup",
    "@ui5/webcomponents.ListItemStandard",
    "@ui5/webcomponents.Menu",
    "@ui5/webcomponents.MenuItem",
    "@ui5/webcomponents.MenuSeparator",
    "@ui5/webcomponents.MessageStrip",
    "@ui5/webcomponents.MultiComboBox",
    "@ui5/webcomponents.MultiComboBoxItem",
    "@ui5/webcomponents.MultiComboBoxItemGroup",
    "@ui5/webcomponents.MultiInput",
    "@ui5/webcomponents.Option",
    "@ui5/webcomponents.OptionCustom",
    "@ui5/webcomponents.Panel",
    "@ui5/webcomponents.Popover",
    "@ui5/webcomponents.ProgressIndicator",
    "@ui5/webcomponents.RadioButton",
    "@ui5/webcomponents.RangeSlider",
    "@ui5/webcomponents.RatingIndicator",
    "@ui5/webcomponents.ResponsivePopover",
    "@ui5/webcomponents.SegmentedButton",
    "@ui5/webcomponents.SegmentedButtonItem",
    "@ui5/webcomponents.Select",
    "@ui5/webcomponents.Slider",
    "@ui5/webcomponents.SpecialCalendarDate",
    "@ui5/webcomponents.SplitButton",
    "@ui5/webcomponents.StepInput",
    "@ui5/webcomponents.SuggestionItem",
    "@ui5/webcomponents.SuggestionItemCustom",
    "@ui5/webcomponents.SuggestionItemGroup",
    "@ui5/webcomponents.Switch",
    "@ui5/webcomponents.Tab",
    "@ui5/webcomponents.TabContainer",
    "@ui5/webcomponents.TabSeparator",
    "@ui5/webcomponents.Table",
    "@ui5/webcomponents.TableCell",
    "@ui5/webcomponents.TableGrowing",
    "@ui5/webcomponents.TableHeaderCell",
    "@ui5/webcomponents.TableHeaderRow",
    "@ui5/webcomponents.TableRow",
    "@ui5/webcomponents.TableRowAction",
    "@ui5/webcomponents.TableRowActionNavigation",
    "@ui5/webcomponents.TableSelection",
    "@ui5/webcomponents.TableVirtualizer",
    "@ui5/webcomponents.Tag",
    "@ui5/webcomponents.Text",
    "@ui5/webcomponents.TextArea",
    "@ui5/webcomponents.TimePicker",
    "@ui5/webcomponents.Title",
    "@ui5/webcomponents.Toast",
    "@ui5/webcomponents.ToggleButton",
    "@ui5/webcomponents.Token",
    "@ui5/webcomponents.Tokenizer",
    "@ui5/webcomponents.Toolbar",
    "@ui5/webcomponents.ToolbarButton",
    "@ui5/webcomponents.ToolbarSelect",
    "@ui5/webcomponents.ToolbarSelectOption",
    "@ui5/webcomponents.ToolbarSeparator",
    "@ui5/webcomponents.ToolbarSpacer",
    "@ui5/webcomponents.Tree",
    "@ui5/webcomponents.TreeItem",
    "@ui5/webcomponents.TreeItemCustom"
  ],
  "elements": [],
  "rootPath": "ui5/ecosystem/demo/app/resources/"
}
  };

  pkg["AvatarColorScheme"] = {
    "Accent1": "Accent1",
    "Accent2": "Accent2",
    "Accent3": "Accent3",
    "Accent4": "Accent4",
    "Accent5": "Accent5",
    "Accent6": "Accent6",
    "Accent7": "Accent7",
    "Accent8": "Accent8",
    "Accent9": "Accent9",
    "Accent10": "Accent10",
    "Placeholder": "Placeholder",
  };
  registerEnum("@ui5/webcomponents.AvatarColorScheme", pkg["AvatarColorScheme"]);
  pkg["AvatarGroupType"] = {
    "Group": "Group",
    "Individual": "Individual",
  };
  registerEnum("@ui5/webcomponents.AvatarGroupType", pkg["AvatarGroupType"]);
  pkg["AvatarShape"] = {
    "Circle": "Circle",
    "Square": "Square",
  };
  registerEnum("@ui5/webcomponents.AvatarShape", pkg["AvatarShape"]);
  pkg["AvatarSize"] = {
    "XS": "XS",
    "S": "S",
    "M": "M",
    "L": "L",
    "XL": "XL",
  };
  registerEnum("@ui5/webcomponents.AvatarSize", pkg["AvatarSize"]);
  pkg["BackgroundDesign"] = {
    "Solid": "Solid",
    "Transparent": "Transparent",
    "Translucent": "Translucent",
  };
  registerEnum("@ui5/webcomponents.BackgroundDesign", pkg["BackgroundDesign"]);
  pkg["BarDesign"] = {
    "Header": "Header",
    "Subheader": "Subheader",
    "Footer": "Footer",
    "FloatingFooter": "FloatingFooter",
  };
  registerEnum("@ui5/webcomponents.BarDesign", pkg["BarDesign"]);
  pkg["BorderDesign"] = {
    "Solid": "Solid",
    "None": "None",
  };
  registerEnum("@ui5/webcomponents.BorderDesign", pkg["BorderDesign"]);
  pkg["BreadcrumbsDesign"] = {
    "Standard": "Standard",
    "NoCurrentPage": "NoCurrentPage",
  };
  registerEnum("@ui5/webcomponents.BreadcrumbsDesign", pkg["BreadcrumbsDesign"]);
  pkg["BreadcrumbsSeparator"] = {
    "Slash": "Slash",
    "BackSlash": "BackSlash",
    "DoubleBackSlash": "DoubleBackSlash",
    "DoubleGreaterThan": "DoubleGreaterThan",
    "DoubleSlash": "DoubleSlash",
    "GreaterThan": "GreaterThan",
  };
  registerEnum("@ui5/webcomponents.BreadcrumbsSeparator", pkg["BreadcrumbsSeparator"]);
  pkg["BusyIndicatorSize"] = {
    "S": "S",
    "M": "M",
    "L": "L",
  };
  registerEnum("@ui5/webcomponents.BusyIndicatorSize", pkg["BusyIndicatorSize"]);
  pkg["BusyIndicatorTextPlacement"] = {
    "Top": "Top",
    "Bottom": "Bottom",
  };
  registerEnum("@ui5/webcomponents.BusyIndicatorTextPlacement", pkg["BusyIndicatorTextPlacement"]);
  pkg["ButtonAccessibleRole"] = {
    "Button": "Button",
    "Link": "Link",
  };
  registerEnum("@ui5/webcomponents.ButtonAccessibleRole", pkg["ButtonAccessibleRole"]);
  pkg["ButtonBadgeDesign"] = {
    "InlineText": "InlineText",
    "OverlayText": "OverlayText",
    "AttentionDot": "AttentionDot",
  };
  registerEnum("@ui5/webcomponents.ButtonBadgeDesign", pkg["ButtonBadgeDesign"]);
  pkg["ButtonDesign"] = {
    "Default": "Default",
    "Positive": "Positive",
    "Negative": "Negative",
    "Transparent": "Transparent",
    "Emphasized": "Emphasized",
    "Attention": "Attention",
  };
  registerEnum("@ui5/webcomponents.ButtonDesign", pkg["ButtonDesign"]);
  pkg["ButtonType"] = {
    "Button": "Button",
    "Submit": "Submit",
    "Reset": "Reset",
  };
  registerEnum("@ui5/webcomponents.ButtonType", pkg["ButtonType"]);
  pkg["CalendarLegendItemType"] = {
    "None": "None",
    "Working": "Working",
    "NonWorking": "NonWorking",
    "Type01": "Type01",
    "Type02": "Type02",
    "Type03": "Type03",
    "Type04": "Type04",
    "Type05": "Type05",
    "Type06": "Type06",
    "Type07": "Type07",
    "Type08": "Type08",
    "Type09": "Type09",
    "Type10": "Type10",
    "Type11": "Type11",
    "Type12": "Type12",
    "Type13": "Type13",
    "Type14": "Type14",
    "Type15": "Type15",
    "Type16": "Type16",
    "Type17": "Type17",
    "Type18": "Type18",
    "Type19": "Type19",
    "Type20": "Type20",
  };
  registerEnum("@ui5/webcomponents.CalendarLegendItemType", pkg["CalendarLegendItemType"]);
  pkg["CalendarSelectionMode"] = {
    "Single": "Single",
    "Multiple": "Multiple",
    "Range": "Range",
  };
  registerEnum("@ui5/webcomponents.CalendarSelectionMode", pkg["CalendarSelectionMode"]);
  pkg["CalendarWeekNumbering"] = {
    "Default": "Default",
    "ISO_8601": "ISO_8601",
    "MiddleEastern": "MiddleEastern",
    "WesternTraditional": "WesternTraditional",
  };
  registerEnum("@ui5/webcomponents.CalendarWeekNumbering", pkg["CalendarWeekNumbering"]);
  pkg["CarouselArrowsPlacement"] = {
    "Content": "Content",
    "Navigation": "Navigation",
  };
  registerEnum("@ui5/webcomponents.CarouselArrowsPlacement", pkg["CarouselArrowsPlacement"]);
  pkg["CarouselPageIndicatorType"] = {
    "Default": "Default",
    "Numeric": "Numeric",
  };
  registerEnum("@ui5/webcomponents.CarouselPageIndicatorType", pkg["CarouselPageIndicatorType"]);
  pkg["ComboBoxFilter"] = {
    "StartsWithPerTerm": "StartsWithPerTerm",
    "StartsWith": "StartsWith",
    "Contains": "Contains",
    "None": "None",
  };
  registerEnum("@ui5/webcomponents.ComboBoxFilter", pkg["ComboBoxFilter"]);
  pkg["ExpandableTextOverflowMode"] = {
    "InPlace": "InPlace",
    "Popover": "Popover",
  };
  registerEnum("@ui5/webcomponents.ExpandableTextOverflowMode", pkg["ExpandableTextOverflowMode"]);
  pkg["FormItemSpacing"] = {
    "Normal": "Normal",
    "Large": "Large",
  };
  registerEnum("@ui5/webcomponents.FormItemSpacing", pkg["FormItemSpacing"]);
  pkg["Highlight"] = {
    "None": "None",
    "Positive": "Positive",
    "Critical": "Critical",
    "Negative": "Negative",
    "Information": "Information",
  };
  registerEnum("@ui5/webcomponents.Highlight", pkg["Highlight"]);
  pkg["IconDesign"] = {
    "Contrast": "Contrast",
    "Critical": "Critical",
    "Default": "Default",
    "Information": "Information",
    "Negative": "Negative",
    "Neutral": "Neutral",
    "NonInteractive": "NonInteractive",
    "Positive": "Positive",
  };
  registerEnum("@ui5/webcomponents.IconDesign", pkg["IconDesign"]);
  pkg["IconMode"] = {
    "Image": "Image",
    "Decorative": "Decorative",
    "Interactive": "Interactive",
  };
  registerEnum("@ui5/webcomponents.IconMode", pkg["IconMode"]);
  pkg["InputType"] = {
    "Text": "Text",
    "Email": "Email",
    "Number": "Number",
    "Password": "Password",
    "Tel": "Tel",
    "URL": "URL",
    "Search": "Search",
  };
  registerEnum("@ui5/webcomponents.InputType", pkg["InputType"]);
  pkg["LinkAccessibleRole"] = {
    "Link": "Link",
    "Button": "Button",
  };
  registerEnum("@ui5/webcomponents.LinkAccessibleRole", pkg["LinkAccessibleRole"]);
  pkg["LinkDesign"] = {
    "Default": "Default",
    "Subtle": "Subtle",
    "Emphasized": "Emphasized",
  };
  registerEnum("@ui5/webcomponents.LinkDesign", pkg["LinkDesign"]);
  pkg["ListAccessibleRole"] = {
    "List": "List",
    "Menu": "Menu",
    "Tree": "Tree",
    "ListBox": "ListBox",
  };
  registerEnum("@ui5/webcomponents.ListAccessibleRole", pkg["ListAccessibleRole"]);
  pkg["ListGrowingMode"] = {
    "Button": "Button",
    "Scroll": "Scroll",
    "None": "None",
  };
  registerEnum("@ui5/webcomponents.ListGrowingMode", pkg["ListGrowingMode"]);
  pkg["ListItemAccessibleRole"] = {
    "ListItem": "ListItem",
    "MenuItem": "MenuItem",
    "TreeItem": "TreeItem",
    "Option": "Option",
    "None": "None",
  };
  registerEnum("@ui5/webcomponents.ListItemAccessibleRole", pkg["ListItemAccessibleRole"]);
  pkg["ListItemType"] = {
    "Inactive": "Inactive",
    "Active": "Active",
    "Detail": "Detail",
    "Navigation": "Navigation",
  };
  registerEnum("@ui5/webcomponents.ListItemType", pkg["ListItemType"]);
  pkg["ListSelectionMode"] = {
    "None": "None",
    "Single": "Single",
    "SingleStart": "SingleStart",
    "SingleEnd": "SingleEnd",
    "SingleAuto": "SingleAuto",
    "Multiple": "Multiple",
    "Delete": "Delete",
  };
  registerEnum("@ui5/webcomponents.ListSelectionMode", pkg["ListSelectionMode"]);
  pkg["ListSeparator"] = {
    "All": "All",
    "Inner": "Inner",
    "None": "None",
  };
  registerEnum("@ui5/webcomponents.ListSeparator", pkg["ListSeparator"]);
  pkg["MessageStripDesign"] = {
    "Information": "Information",
    "Positive": "Positive",
    "Negative": "Negative",
    "Critical": "Critical",
    "ColorSet1": "ColorSet1",
    "ColorSet2": "ColorSet2",
  };
  registerEnum("@ui5/webcomponents.MessageStripDesign", pkg["MessageStripDesign"]);
  pkg["NotificationListGrowingMode"] = {
    "Button": "Button",
    "None": "None",
  };
  registerEnum("@ui5/webcomponents.NotificationListGrowingMode", pkg["NotificationListGrowingMode"]);
  pkg["OverflowMode"] = {
    "End": "End",
    "StartAndEnd": "StartAndEnd",
  };
  registerEnum("@ui5/webcomponents.OverflowMode", pkg["OverflowMode"]);
  pkg["PanelAccessibleRole"] = {
    "Complementary": "Complementary",
    "Form": "Form",
    "Region": "Region",
  };
  registerEnum("@ui5/webcomponents.PanelAccessibleRole", pkg["PanelAccessibleRole"]);
  pkg["PopoverHorizontalAlign"] = {
    "Center": "Center",
    "Start": "Start",
    "End": "End",
    "Stretch": "Stretch",
  };
  registerEnum("@ui5/webcomponents.PopoverHorizontalAlign", pkg["PopoverHorizontalAlign"]);
  pkg["PopoverPlacement"] = {
    "Start": "Start",
    "End": "End",
    "Top": "Top",
    "Bottom": "Bottom",
  };
  registerEnum("@ui5/webcomponents.PopoverPlacement", pkg["PopoverPlacement"]);
  pkg["PopoverVerticalAlign"] = {
    "Center": "Center",
    "Top": "Top",
    "Bottom": "Bottom",
    "Stretch": "Stretch",
  };
  registerEnum("@ui5/webcomponents.PopoverVerticalAlign", pkg["PopoverVerticalAlign"]);
  pkg["PopupAccessibleRole"] = {
    "None": "None",
    "Dialog": "Dialog",
    "AlertDialog": "AlertDialog",
  };
  registerEnum("@ui5/webcomponents.PopupAccessibleRole", pkg["PopupAccessibleRole"]);
  pkg["Priority"] = {
    "High": "High",
    "Medium": "Medium",
    "Low": "Low",
    "None": "None",
  };
  registerEnum("@ui5/webcomponents.Priority", pkg["Priority"]);
  pkg["RatingIndicatorSize"] = {
    "S": "S",
    "M": "M",
    "L": "L",
  };
  registerEnum("@ui5/webcomponents.RatingIndicatorSize", pkg["RatingIndicatorSize"]);
  pkg["SegmentedButtonSelectionMode"] = {
    "Single": "Single",
    "Multiple": "Multiple",
  };
  registerEnum("@ui5/webcomponents.SegmentedButtonSelectionMode", pkg["SegmentedButtonSelectionMode"]);
  pkg["SemanticColor"] = {
    "Default": "Default",
    "Positive": "Positive",
    "Negative": "Negative",
    "Critical": "Critical",
    "Neutral": "Neutral",
  };
  registerEnum("@ui5/webcomponents.SemanticColor", pkg["SemanticColor"]);
  pkg["SwitchDesign"] = {
    "Textual": "Textual",
    "Graphical": "Graphical",
  };
  registerEnum("@ui5/webcomponents.SwitchDesign", pkg["SwitchDesign"]);
  pkg["TabLayout"] = {
    "Inline": "Inline",
    "Standard": "Standard",
  };
  registerEnum("@ui5/webcomponents.TabLayout", pkg["TabLayout"]);
  pkg["TableCellHorizontalAlign"] = {
    "Left": "Left",
    "Start": "Start",
    "Right": "Right",
    "End": "End",
    "Center": "Center",
  };
  registerEnum("@ui5/webcomponents.TableCellHorizontalAlign", pkg["TableCellHorizontalAlign"]);
  pkg["TableGrowingMode"] = {
    "Button": "Button",
    "Scroll": "Scroll",
  };
  registerEnum("@ui5/webcomponents.TableGrowingMode", pkg["TableGrowingMode"]);
  pkg["TableOverflowMode"] = {
    "Scroll": "Scroll",
    "Popin": "Popin",
  };
  registerEnum("@ui5/webcomponents.TableOverflowMode", pkg["TableOverflowMode"]);
  pkg["TableSelectionMode"] = {
    "None": "None",
    "Single": "Single",
    "Multiple": "Multiple",
  };
  registerEnum("@ui5/webcomponents.TableSelectionMode", pkg["TableSelectionMode"]);
  pkg["TagDesign"] = {
    "Set1": "Set1",
    "Set2": "Set2",
    "Neutral": "Neutral",
    "Information": "Information",
    "Positive": "Positive",
    "Negative": "Negative",
    "Critical": "Critical",
  };
  registerEnum("@ui5/webcomponents.TagDesign", pkg["TagDesign"]);
  pkg["TagSize"] = {
    "S": "S",
    "L": "L",
  };
  registerEnum("@ui5/webcomponents.TagSize", pkg["TagSize"]);
  pkg["TextEmptyIndicatorMode"] = {
    "Off": "Off",
    "On": "On",
  };
  registerEnum("@ui5/webcomponents.TextEmptyIndicatorMode", pkg["TextEmptyIndicatorMode"]);
  pkg["TitleLevel"] = {
    "H1": "H1",
    "H2": "H2",
    "H3": "H3",
    "H4": "H4",
    "H5": "H5",
    "H6": "H6",
  };
  registerEnum("@ui5/webcomponents.TitleLevel", pkg["TitleLevel"]);
  pkg["ToastPlacement"] = {
    "TopStart": "TopStart",
    "TopCenter": "TopCenter",
    "TopEnd": "TopEnd",
    "MiddleStart": "MiddleStart",
    "MiddleCenter": "MiddleCenter",
    "MiddleEnd": "MiddleEnd",
    "BottomStart": "BottomStart",
    "BottomCenter": "BottomCenter",
    "BottomEnd": "BottomEnd",
  };
  registerEnum("@ui5/webcomponents.ToastPlacement", pkg["ToastPlacement"]);
  pkg["ToolbarAlign"] = {
    "Start": "Start",
    "End": "End",
  };
  registerEnum("@ui5/webcomponents.ToolbarAlign", pkg["ToolbarAlign"]);
  pkg["ToolbarDesign"] = {
    "Solid": "Solid",
    "Transparent": "Transparent",
  };
  registerEnum("@ui5/webcomponents.ToolbarDesign", pkg["ToolbarDesign"]);
  pkg["ToolbarItemOverflowBehavior"] = {
    "Default": "Default",
    "NeverOverflow": "NeverOverflow",
    "AlwaysOverflow": "AlwaysOverflow",
  };
  registerEnum("@ui5/webcomponents.ToolbarItemOverflowBehavior", pkg["ToolbarItemOverflowBehavior"]);
  pkg["WrappingType"] = {
    "None": "None",
    "Normal": "Normal",
  };
  registerEnum("@ui5/webcomponents.WrappingType", pkg["WrappingType"]);


  return pkg;
});
