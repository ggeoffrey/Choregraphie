interface customCallback{
	(JQueryEventObject, any): void;
}

interface JQuery {
	dateRangeSlider(any): void;
	bind(string, customCallback ):JQuery;
}