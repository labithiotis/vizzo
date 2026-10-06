# Pick a chart. Make it yours.

Lines, bars, layered areas, multiple series, dates, and proportions. Every image starts with the same small JSON envelope.

## Start from a working definition

Every chart image on this site is rendered by the Vizzo API. Previews use live image URLs with an explicit theme and follow your device's light or dark preference. GET images are cached for 30 days; cache hits do not consume your render allowance. Copy the JSURL2 URL and change values in the address bar, or download the JSON to render it locally.

Use PNG for broad attachment support, WebP for smaller files when your destination accepts it, and SVG when you need scalable vector output. The renderer does not publish or send anything for you.

<!-- examples -->

## Line chart

![Monthly revenue line chart](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~lineY~data~!(month~Jan~revenue~42000)(month~Feb~revenue~58000)(month~Mar~revenue~76000)(month~Apr~revenue~64000)(month~May~revenue~81000)(month~Jun~revenue~93000)~options~(x~month~y~revenue~points~~stroke~**H2563eb))~scales~(x~(scale~point~padding~0.2~label~Month)y~(scale~linear~nice~~grid~~label~Revenue_*CUSD*D)))theme~light)~)

[Download JSON](/docs/examples/line.json) · [Open editable chart URL](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~lineY~data~!(month~Jan~revenue~42000)(month~Feb~revenue~58000)(month~Mar~revenue~76000)(month~Apr~revenue~64000)(month~May~revenue~81000)(month~Jun~revenue~93000)~options~(x~month~y~revenue~points~~stroke~**H2563eb))~scales~(x~(scale~point~padding~0.2~label~Month)y~(scale~linear~nice~~grid~~label~Revenue_*CUSD*D)))theme~light)~)

```sh
npx vizzo line.json line.png --theme light
```

## Multiple series

![Downloads grouped by package](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~lineY~data~!(week~W1~downloads~120~package~core)(week~W2~downloads~180~package~core)(week~W3~downloads~260~package~core)(week~W4~downloads~310~package~core)(week~W1~downloads~60~package~cli)(week~W2~downloads~95~package~cli)(week~W3~downloads~140~package~cli)(week~W4~downloads~205~package~cli)(week~W1~downloads~20~package~schemas)(week~W2~downloads~28~package~schemas)(week~W3~downloads~45~package~schemas)(week~W4~downloads~70~package~schemas)~options~(x~week~y~downloads~z~package~color~package~strokeWidth~2.5~points))~scales~(x~(scale~point~label~Week)y~(scale~linear~nice~~grid~~label~Downloads))color~(legend~(label~Package)))theme~light)~)

The `z` field groups the line paths. The `color` field gives each package a color and legend entry.

[Download JSON](/docs/examples/multi-series.json) · [Open editable chart URL](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~lineY~data~!(week~W1~downloads~120~package~core)(week~W2~downloads~180~package~core)(week~W3~downloads~260~package~core)(week~W4~downloads~310~package~core)(week~W1~downloads~60~package~cli)(week~W2~downloads~95~package~cli)(week~W3~downloads~140~package~cli)(week~W4~downloads~205~package~cli)(week~W1~downloads~20~package~schemas)(week~W2~downloads~28~package~schemas)(week~W3~downloads~45~package~schemas)(week~W4~downloads~70~package~schemas)~options~(x~week~y~downloads~z~package~color~package~strokeWidth~2.5~points))~scales~(x~(scale~point~label~Week)y~(scale~linear~nice~~grid~~label~Downloads))color~(legend~(label~Package)))theme~light)~)

```sh
npx vizzo multi-series.json multi-series.png --theme light
```

## Bar chart

![Letter frequencies as bars](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~barY~data~!(letter~A~frequency~0.08167)(letter~B~frequency~0.01492)(letter~E~frequency~0.12702)(letter~T~frequency~0.09056)(letter~O~frequency~0.07507)(letter~I~frequency~0.06966)~options~(x~letter~y~frequency~fill~**H16a34a))~scales~(x~(scale~band~padding~0.12~label~Letter)y~(scale~linear~nice~~grid~~label~Frequency)))theme~light)~)

The `band` scale provides space for each category. For a horizontal comparison, change `barY` to `barX`, exchange the x/y field mappings, and put the band scale on y and the linear scale on x.

[Download JSON](/docs/examples/bar.json) · [Open editable chart URL](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~barY~data~!(letter~A~frequency~0.08167)(letter~B~frequency~0.01492)(letter~E~frequency~0.12702)(letter~T~frequency~0.09056)(letter~O~frequency~0.07507)(letter~I~frequency~0.06966)~options~(x~letter~y~frequency~fill~**H16a34a))~scales~(x~(scale~band~padding~0.12~label~Letter)y~(scale~linear~nice~~grid~~label~Frequency)))theme~light)~)

```sh
npx vizzo bar.json bar.png --theme light
```

## Layered area and line

![Weekly active users with area and line marks](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~areaY~data~!(day~Mon~users~120)(day~Tue~users~156)(day~Wed~users~142)(day~Thu~users~189)(day~Fri~users~205)(day~Sat~users~98)(day~Sun~users~84)~options~(x~day~y~users~fill~**H0891b2~fillOpacity~0.25))(type~lineY~data~!(day~Mon~users~120)(day~Tue~users~156)(day~Wed~users~142)(day~Thu~users~189)(day~Fri~users~205)(day~Sat~users~98)(day~Sun~users~84)~options~(x~day~y~users~stroke~**H0891b2))~scales~(x~(scale~point~label~Day)y~(scale~linear~nice~~grid~~label~Active_Users)))theme~light)~)

The same data feeds an `areaY` mark and a `lineY` mark. This uses the normal `marks` array, without a special combined chart type.

[Download JSON](/docs/examples/area.json) · [Open editable chart URL](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~areaY~data~!(day~Mon~users~120)(day~Tue~users~156)(day~Wed~users~142)(day~Thu~users~189)(day~Fri~users~205)(day~Sat~users~98)(day~Sun~users~84)~options~(x~day~y~users~fill~**H0891b2~fillOpacity~0.25))(type~lineY~data~!(day~Mon~users~120)(day~Tue~users~156)(day~Wed~users~142)(day~Thu~users~189)(day~Fri~users~205)(day~Sat~users~98)(day~Sun~users~84)~options~(x~day~y~users~stroke~**H0891b2))~scales~(x~(scale~point~label~Day)y~(scale~linear~nice~~grid~~label~Active_Users)))theme~light)~)

```sh
npx vizzo area.json area.png --theme light
```

## UTC time series

![Monthly signups over a UTC date axis](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~lineY~data~!(date~*2024-01-01~value~42)(date~*2024-02-01~value~58)(date~*2024-03-01~value~51)(date~*2024-04-01~value~66)(date~*2024-05-01~value~74)(date~*2024-06-01~value~69)(date~*2024-07-01~value~88)(date~*2024-08-01~value~95)(date~*2024-09-01~value~82)(date~*2024-10-01~value~101)(date~*2024-11-01~value~96)(date~*2024-12-01~value~118)~options~(x~date~y~value~points~~stroke~**H7c3aed))~scales~(x~(scale~utc~label~Month)y~(scale~linear~nice~~grid~~label~Signups)))theme~light)~)

Use ISO date strings with `"scale": "utc"`. Vizzo hydrates the date values for TanStack's UTC scale.

[Download JSON](/docs/examples/time-series.json) · [Open editable chart URL](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~lineY~data~!(date~*2024-01-01~value~42)(date~*2024-02-01~value~58)(date~*2024-03-01~value~51)(date~*2024-04-01~value~66)(date~*2024-05-01~value~74)(date~*2024-06-01~value~69)(date~*2024-07-01~value~88)(date~*2024-08-01~value~95)(date~*2024-09-01~value~82)(date~*2024-10-01~value~101)(date~*2024-11-01~value~96)(date~*2024-12-01~value~118)~options~(x~date~y~value~points~~stroke~**H7c3aed))~scales~(x~(scale~utc~label~Month)y~(scale~linear~nice~~grid~~label~Signups)))theme~light)~)

```sh
npx vizzo time-series.json time-series.png --theme light
```

## Pie chart

![Letter frequency proportions as a pie chart](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~pie~data~!(letter~E~frequency~0.12702)(letter~T~frequency~0.09056)(letter~A~frequency~0.08167)(letter~O~frequency~0.07507)(letter~I~frequency~0.06966)(letter~N~frequency~0.06749)~options~(value~frequency~color~letter~key~letter~innerRadius~0))~scales~(x~_N~y~_N)color~(legend~(label~Letter)))theme~light)~)

The `value` option defines the slice size. Set `innerRadius` above zero for a donut.

[Download JSON](/docs/examples/pie.json) · [Open editable chart URL](https://vizzo.dev/x?width=960&height=540&theme=light&data=(definition~(marks~!(type~pie~data~!(letter~E~frequency~0.12702)(letter~T~frequency~0.09056)(letter~A~frequency~0.08167)(letter~O~frequency~0.07507)(letter~I~frequency~0.06966)(letter~N~frequency~0.06749)~options~(value~frequency~color~letter~key~letter~innerRadius~0))~scales~(x~_N~y~_N)color~(legend~(label~Letter)))theme~light)~)

```sh
npx vizzo pie.json pie.png --theme light
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
curl https://vizzo.dev/ \
  -H 'Content-Type: application/json' \
  --data-binary @multi-series.json \
  --output multi-series.png
```
