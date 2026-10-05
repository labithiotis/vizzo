## Start from a working definition

Every preview is a static SVG rendered by Vizzo. Opening a chart URL requests a PNG from the public renderer. Copy the JSURL2 URL and change values in the address bar, or download the JSON to render it locally.

Use PNG for broad attachment support, WebP for smaller files when your destination accepts it, and SVG when you need scalable vector output. The renderer does not publish or send anything for you.

<!-- examples -->

## Line chart

![Monthly revenue line chart](/docs/examples/line.svg)

[Download JSON](/docs/examples/line.json) · [Open editable chart URL]({{line.url}})

```sh
{{line.command}}
```

## Multiple series

![Downloads grouped by package](/docs/examples/multi-series.svg)

The `z` field groups the line paths. The `color` field gives each package a color and legend entry.

[Download JSON](/docs/examples/multi-series.json) · [Open editable chart URL]({{multi-series.url}})

```sh
{{multi-series.command}}
```

## Bar chart

![Letter frequencies as bars](/docs/examples/bar.svg)

The `band` scale provides space for each category. For a horizontal comparison, change `barY` to `barX`, exchange the x/y field mappings, and put the band scale on y and the linear scale on x.

[Download JSON](/docs/examples/bar.json) · [Open editable chart URL]({{bar.url}})

```sh
{{bar.command}}
```

## Layered area and line

![Weekly active users with area and line marks](/docs/examples/area.svg)

The same data feeds an `areaY` mark and a `lineY` mark. This uses the normal `marks` array, without a special combined chart type.

[Download JSON](/docs/examples/area.json) · [Open editable chart URL]({{area.url}})

```sh
{{area.command}}
```

## UTC time series

![Monthly signups over a UTC date axis](/docs/examples/time-series.svg)

Use ISO date strings with `"scale": "utc"`. Vizzo hydrates the date values for TanStack's UTC scale.

[Download JSON](/docs/examples/time-series.json) · [Open editable chart URL]({{time-series.url}})

```sh
{{time-series.command}}
```

## Pie chart

![Letter frequency proportions as a pie chart](/docs/examples/pie.svg)

The `value` option defines the slice size. Set `innerRadius` above zero for a donut.

[Download JSON](/docs/examples/pie.json) · [Open editable chart URL]({{pie.url}})

```sh
{{pie.command}}
```

<!-- sharing -->

## Send a report to a conversation

```sh
# A dark PNG sized for a Discord attachment
npx vizzo multi-series.json report.png --preset discord --theme dark

# A PNG sized for a tweet
npx vizzo line.json update.png --preset twitter

# A compact image for an email body
npx vizzo area.json digest.png --width 800 --height 450
```

Upload the generated file to your destination. For automated reports, call the SDK or [HTTP API](/docs/http), then pass the returned bytes to your platform's attachment API. To send any downloaded example as JSON over HTTP:

```sh
{{multi-series.post}}
```
