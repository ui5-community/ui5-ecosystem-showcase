sap.ui.define(['sap/ui/core/Lib', 'sap/ui/base/DataType', '../webcomponents-base/library', 'sap/base/strings/hyphenate', 'sap/ui/core/webc/WebComponentRenderer'], (function (Library, DataType, _ui5_webcomponentsBase_library, hyphenate, WebComponentRenderer) { 'use strict';

	const theLibrary = Library.init({
	  "apiVersion": 2,
	  "name": "@ui5/webcomponents",
	  "dependencies": [
	    "sap.ui.core",
	    "@ui5/webcomponents-base"
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
	    "@ui5/webcomponents.ButtonDesign",
	    "@ui5/webcomponents.ButtonType",
	    "@ui5/webcomponents.CalendarLegendItemType",
	    "@ui5/webcomponents.CalendarSelectionMode",
	    "@ui5/webcomponents.CarouselArrowsPlacement",
	    "@ui5/webcomponents.CarouselPageIndicatorType",
	    "@ui5/webcomponents.ComboBoxFilter",
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
	    "@ui5/webcomponents.OverflowMode",
	    "@ui5/webcomponents.PanelAccessibleRole",
	    "@ui5/webcomponents.PopoverHorizontalAlign",
	    "@ui5/webcomponents.PopoverPlacement",
	    "@ui5/webcomponents.PopoverVerticalAlign",
	    "@ui5/webcomponents.PopupAccessibleRole",
	    "@ui5/webcomponents.Priority",
	    "@ui5/webcomponents.SegmentedButtonSelectionMode",
	    "@ui5/webcomponents.SemanticColor",
	    "@ui5/webcomponents.SwitchDesign",
	    "@ui5/webcomponents.TabLayout",
	    "@ui5/webcomponents.TableGrowingMode",
	    "@ui5/webcomponents.TableOverflowMode",
	    "@ui5/webcomponents.TableSelectionMode",
	    "@ui5/webcomponents.TagDesign",
	    "@ui5/webcomponents.TagSize",
	    "@ui5/webcomponents.TitleLevel",
	    "@ui5/webcomponents.ToastPlacement",
	    "@ui5/webcomponents.ToolbarAlign",
	    "@ui5/webcomponents.ToolbarDesign",
	    "@ui5/webcomponents.ToolbarItemOverflowBehavior",
	    "@ui5/webcomponents.WrappingType"
	  ],
	  "elements": [],
	  "controls": [
	    "@ui5/webcomponents.Avatar",
	    "@ui5/webcomponents.AvatarGroup",
	    "@ui5/webcomponents.Bar",
	    "@ui5/webcomponents.Breadcrumbs",
	    "@ui5/webcomponents.BreadcrumbsItem",
	    "@ui5/webcomponents.BusyIndicator",
	    "@ui5/webcomponents.Button",
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
	    "@ui5/webcomponents.TableSelection",
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
	  "interfaces": [],
	  "designtime": "@ui5/webcomponents/designtime/library.designtime",
	  "extensions": {
	    "flChangeHandlers": {
	      "@ui5/webcomponents.Avatar": {
	        "hideControl": "default",
	        "unhideControl": "default"
	      },
	      "@ui5/webcomponents.Button": "@ui5/webcomponents-flexibility.Button"
	    }
	  },
	  "noLibraryCSS": true
	});

	theLibrary["AvatarColorScheme"] = {
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
	DataType.registerEnum("@ui5/webcomponents.AvatarColorScheme", theLibrary["AvatarColorScheme"]);
	theLibrary["AvatarGroupType"] = {
		"Group": "Group",
		"Individual": "Individual",
	};
	DataType.registerEnum("@ui5/webcomponents.AvatarGroupType", theLibrary["AvatarGroupType"]);
	theLibrary["AvatarShape"] = {
		"Circle": "Circle",
		"Square": "Square",
	};
	DataType.registerEnum("@ui5/webcomponents.AvatarShape", theLibrary["AvatarShape"]);
	theLibrary["AvatarSize"] = {
		"XS": "XS",
		"S": "S",
		"M": "M",
		"L": "L",
		"XL": "XL",
	};
	DataType.registerEnum("@ui5/webcomponents.AvatarSize", theLibrary["AvatarSize"]);
	theLibrary["BackgroundDesign"] = {
		"Solid": "Solid",
		"Transparent": "Transparent",
		"Translucent": "Translucent",
	};
	DataType.registerEnum("@ui5/webcomponents.BackgroundDesign", theLibrary["BackgroundDesign"]);
	theLibrary["BarDesign"] = {
		"Header": "Header",
		"Subheader": "Subheader",
		"Footer": "Footer",
		"FloatingFooter": "FloatingFooter",
	};
	DataType.registerEnum("@ui5/webcomponents.BarDesign", theLibrary["BarDesign"]);
	theLibrary["BorderDesign"] = {
		"Solid": "Solid",
		"None": "None",
	};
	DataType.registerEnum("@ui5/webcomponents.BorderDesign", theLibrary["BorderDesign"]);
	theLibrary["BreadcrumbsDesign"] = {
		"Standard": "Standard",
		"NoCurrentPage": "NoCurrentPage",
	};
	DataType.registerEnum("@ui5/webcomponents.BreadcrumbsDesign", theLibrary["BreadcrumbsDesign"]);
	theLibrary["BreadcrumbsSeparator"] = {
		"Slash": "Slash",
		"BackSlash": "BackSlash",
		"DoubleBackSlash": "DoubleBackSlash",
		"DoubleGreaterThan": "DoubleGreaterThan",
		"DoubleSlash": "DoubleSlash",
		"GreaterThan": "GreaterThan",
	};
	DataType.registerEnum("@ui5/webcomponents.BreadcrumbsSeparator", theLibrary["BreadcrumbsSeparator"]);
	theLibrary["BusyIndicatorSize"] = {
		"S": "S",
		"M": "M",
		"L": "L",
	};
	DataType.registerEnum("@ui5/webcomponents.BusyIndicatorSize", theLibrary["BusyIndicatorSize"]);
	theLibrary["BusyIndicatorTextPlacement"] = {
		"Top": "Top",
		"Bottom": "Bottom",
	};
	DataType.registerEnum("@ui5/webcomponents.BusyIndicatorTextPlacement", theLibrary["BusyIndicatorTextPlacement"]);
	theLibrary["ButtonAccessibleRole"] = {
		"Button": "Button",
		"Link": "Link",
	};
	DataType.registerEnum("@ui5/webcomponents.ButtonAccessibleRole", theLibrary["ButtonAccessibleRole"]);
	theLibrary["ButtonDesign"] = {
		"Default": "Default",
		"Positive": "Positive",
		"Negative": "Negative",
		"Transparent": "Transparent",
		"Emphasized": "Emphasized",
		"Attention": "Attention",
	};
	DataType.registerEnum("@ui5/webcomponents.ButtonDesign", theLibrary["ButtonDesign"]);
	theLibrary["ButtonType"] = {
		"Button": "Button",
		"Submit": "Submit",
		"Reset": "Reset",
	};
	DataType.registerEnum("@ui5/webcomponents.ButtonType", theLibrary["ButtonType"]);
	theLibrary["CalendarLegendItemType"] = {
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
	DataType.registerEnum("@ui5/webcomponents.CalendarLegendItemType", theLibrary["CalendarLegendItemType"]);
	theLibrary["CalendarSelectionMode"] = {
		"Single": "Single",
		"Multiple": "Multiple",
		"Range": "Range",
	};
	DataType.registerEnum("@ui5/webcomponents.CalendarSelectionMode", theLibrary["CalendarSelectionMode"]);
	theLibrary["CarouselArrowsPlacement"] = {
		"Content": "Content",
		"Navigation": "Navigation",
	};
	DataType.registerEnum("@ui5/webcomponents.CarouselArrowsPlacement", theLibrary["CarouselArrowsPlacement"]);
	theLibrary["CarouselPageIndicatorType"] = {
		"Default": "Default",
		"Numeric": "Numeric",
	};
	DataType.registerEnum("@ui5/webcomponents.CarouselPageIndicatorType", theLibrary["CarouselPageIndicatorType"]);
	theLibrary["ComboBoxFilter"] = {
		"StartsWithPerTerm": "StartsWithPerTerm",
		"StartsWith": "StartsWith",
		"Contains": "Contains",
		"None": "None",
	};
	DataType.registerEnum("@ui5/webcomponents.ComboBoxFilter", theLibrary["ComboBoxFilter"]);
	theLibrary["FormItemSpacing"] = {
		"Normal": "Normal",
		"Large": "Large",
	};
	DataType.registerEnum("@ui5/webcomponents.FormItemSpacing", theLibrary["FormItemSpacing"]);
	theLibrary["Highlight"] = {
		"None": "None",
		"Positive": "Positive",
		"Critical": "Critical",
		"Negative": "Negative",
		"Information": "Information",
	};
	DataType.registerEnum("@ui5/webcomponents.Highlight", theLibrary["Highlight"]);
	theLibrary["IconDesign"] = {
		"Contrast": "Contrast",
		"Critical": "Critical",
		"Default": "Default",
		"Information": "Information",
		"Negative": "Negative",
		"Neutral": "Neutral",
		"NonInteractive": "NonInteractive",
		"Positive": "Positive",
	};
	DataType.registerEnum("@ui5/webcomponents.IconDesign", theLibrary["IconDesign"]);
	theLibrary["IconMode"] = {
		"Image": "Image",
		"Decorative": "Decorative",
		"Interactive": "Interactive",
	};
	DataType.registerEnum("@ui5/webcomponents.IconMode", theLibrary["IconMode"]);
	theLibrary["InputType"] = {
		"Text": "Text",
		"Email": "Email",
		"Number": "Number",
		"Password": "Password",
		"Tel": "Tel",
		"URL": "URL",
		"Search": "Search",
	};
	DataType.registerEnum("@ui5/webcomponents.InputType", theLibrary["InputType"]);
	theLibrary["LinkAccessibleRole"] = {
		"Link": "Link",
		"Button": "Button",
	};
	DataType.registerEnum("@ui5/webcomponents.LinkAccessibleRole", theLibrary["LinkAccessibleRole"]);
	theLibrary["LinkDesign"] = {
		"Default": "Default",
		"Subtle": "Subtle",
		"Emphasized": "Emphasized",
	};
	DataType.registerEnum("@ui5/webcomponents.LinkDesign", theLibrary["LinkDesign"]);
	theLibrary["ListAccessibleRole"] = {
		"List": "List",
		"Menu": "Menu",
		"Tree": "Tree",
		"ListBox": "ListBox",
	};
	DataType.registerEnum("@ui5/webcomponents.ListAccessibleRole", theLibrary["ListAccessibleRole"]);
	theLibrary["ListGrowingMode"] = {
		"Button": "Button",
		"Scroll": "Scroll",
		"None": "None",
	};
	DataType.registerEnum("@ui5/webcomponents.ListGrowingMode", theLibrary["ListGrowingMode"]);
	theLibrary["ListItemAccessibleRole"] = {
		"ListItem": "ListItem",
		"MenuItem": "MenuItem",
		"TreeItem": "TreeItem",
		"Option": "Option",
		"None": "None",
	};
	DataType.registerEnum("@ui5/webcomponents.ListItemAccessibleRole", theLibrary["ListItemAccessibleRole"]);
	theLibrary["ListItemType"] = {
		"Inactive": "Inactive",
		"Active": "Active",
		"Detail": "Detail",
		"Navigation": "Navigation",
	};
	DataType.registerEnum("@ui5/webcomponents.ListItemType", theLibrary["ListItemType"]);
	theLibrary["ListSelectionMode"] = {
		"None": "None",
		"Single": "Single",
		"SingleStart": "SingleStart",
		"SingleEnd": "SingleEnd",
		"SingleAuto": "SingleAuto",
		"Multiple": "Multiple",
		"Delete": "Delete",
	};
	DataType.registerEnum("@ui5/webcomponents.ListSelectionMode", theLibrary["ListSelectionMode"]);
	theLibrary["ListSeparator"] = {
		"All": "All",
		"Inner": "Inner",
		"None": "None",
	};
	DataType.registerEnum("@ui5/webcomponents.ListSeparator", theLibrary["ListSeparator"]);
	theLibrary["MessageStripDesign"] = {
		"Information": "Information",
		"Positive": "Positive",
		"Negative": "Negative",
		"Critical": "Critical",
		"ColorSet1": "ColorSet1",
		"ColorSet2": "ColorSet2",
	};
	DataType.registerEnum("@ui5/webcomponents.MessageStripDesign", theLibrary["MessageStripDesign"]);
	theLibrary["OverflowMode"] = {
		"End": "End",
		"StartAndEnd": "StartAndEnd",
	};
	DataType.registerEnum("@ui5/webcomponents.OverflowMode", theLibrary["OverflowMode"]);
	theLibrary["PanelAccessibleRole"] = {
		"Complementary": "Complementary",
		"Form": "Form",
		"Region": "Region",
	};
	DataType.registerEnum("@ui5/webcomponents.PanelAccessibleRole", theLibrary["PanelAccessibleRole"]);
	theLibrary["PopoverHorizontalAlign"] = {
		"Center": "Center",
		"Start": "Start",
		"End": "End",
		"Stretch": "Stretch",
	};
	DataType.registerEnum("@ui5/webcomponents.PopoverHorizontalAlign", theLibrary["PopoverHorizontalAlign"]);
	theLibrary["PopoverPlacement"] = {
		"Start": "Start",
		"End": "End",
		"Top": "Top",
		"Bottom": "Bottom",
	};
	DataType.registerEnum("@ui5/webcomponents.PopoverPlacement", theLibrary["PopoverPlacement"]);
	theLibrary["PopoverVerticalAlign"] = {
		"Center": "Center",
		"Top": "Top",
		"Bottom": "Bottom",
		"Stretch": "Stretch",
	};
	DataType.registerEnum("@ui5/webcomponents.PopoverVerticalAlign", theLibrary["PopoverVerticalAlign"]);
	theLibrary["PopupAccessibleRole"] = {
		"None": "None",
		"Dialog": "Dialog",
		"AlertDialog": "AlertDialog",
	};
	DataType.registerEnum("@ui5/webcomponents.PopupAccessibleRole", theLibrary["PopupAccessibleRole"]);
	theLibrary["Priority"] = {
		"High": "High",
		"Medium": "Medium",
		"Low": "Low",
		"None": "None",
	};
	DataType.registerEnum("@ui5/webcomponents.Priority", theLibrary["Priority"]);
	theLibrary["SegmentedButtonSelectionMode"] = {
		"Single": "Single",
		"Multiple": "Multiple",
	};
	DataType.registerEnum("@ui5/webcomponents.SegmentedButtonSelectionMode", theLibrary["SegmentedButtonSelectionMode"]);
	theLibrary["SemanticColor"] = {
		"Default": "Default",
		"Positive": "Positive",
		"Negative": "Negative",
		"Critical": "Critical",
		"Neutral": "Neutral",
	};
	DataType.registerEnum("@ui5/webcomponents.SemanticColor", theLibrary["SemanticColor"]);
	theLibrary["SwitchDesign"] = {
		"Textual": "Textual",
		"Graphical": "Graphical",
	};
	DataType.registerEnum("@ui5/webcomponents.SwitchDesign", theLibrary["SwitchDesign"]);
	theLibrary["TabLayout"] = {
		"Inline": "Inline",
		"Standard": "Standard",
	};
	DataType.registerEnum("@ui5/webcomponents.TabLayout", theLibrary["TabLayout"]);
	theLibrary["TableGrowingMode"] = {
		"Button": "Button",
		"Scroll": "Scroll",
	};
	DataType.registerEnum("@ui5/webcomponents.TableGrowingMode", theLibrary["TableGrowingMode"]);
	theLibrary["TableOverflowMode"] = {
		"Scroll": "Scroll",
		"Popin": "Popin",
	};
	DataType.registerEnum("@ui5/webcomponents.TableOverflowMode", theLibrary["TableOverflowMode"]);
	theLibrary["TableSelectionMode"] = {
		"None": "None",
		"Single": "Single",
		"Multiple": "Multiple",
	};
	DataType.registerEnum("@ui5/webcomponents.TableSelectionMode", theLibrary["TableSelectionMode"]);
	theLibrary["TagDesign"] = {
		"Set1": "Set1",
		"Set2": "Set2",
		"Neutral": "Neutral",
		"Information": "Information",
		"Positive": "Positive",
		"Negative": "Negative",
		"Critical": "Critical",
	};
	DataType.registerEnum("@ui5/webcomponents.TagDesign", theLibrary["TagDesign"]);
	theLibrary["TagSize"] = {
		"S": "S",
		"L": "L",
	};
	DataType.registerEnum("@ui5/webcomponents.TagSize", theLibrary["TagSize"]);
	theLibrary["TitleLevel"] = {
		"H1": "H1",
		"H2": "H2",
		"H3": "H3",
		"H4": "H4",
		"H5": "H5",
		"H6": "H6",
	};
	DataType.registerEnum("@ui5/webcomponents.TitleLevel", theLibrary["TitleLevel"]);
	theLibrary["ToastPlacement"] = {
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
	DataType.registerEnum("@ui5/webcomponents.ToastPlacement", theLibrary["ToastPlacement"]);
	theLibrary["ToolbarAlign"] = {
		"Start": "Start",
		"End": "End",
	};
	DataType.registerEnum("@ui5/webcomponents.ToolbarAlign", theLibrary["ToolbarAlign"]);
	theLibrary["ToolbarDesign"] = {
		"Solid": "Solid",
		"Transparent": "Transparent",
	};
	DataType.registerEnum("@ui5/webcomponents.ToolbarDesign", theLibrary["ToolbarDesign"]);
	theLibrary["ToolbarItemOverflowBehavior"] = {
		"Default": "Default",
		"NeverOverflow": "NeverOverflow",
		"AlwaysOverflow": "AlwaysOverflow",
	};
	DataType.registerEnum("@ui5/webcomponents.ToolbarItemOverflowBehavior", theLibrary["ToolbarItemOverflowBehavior"]);
	theLibrary["WrappingType"] = {
		"None": "None",
		"Normal": "Normal",
	};
	DataType.registerEnum("@ui5/webcomponents.WrappingType", theLibrary["WrappingType"]);

	return theLibrary;

}));
