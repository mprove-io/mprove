# pipe state access

After the initial `Result.succeed`, access pipeline data only through `v`. Do
not reference `item`, destructured item properties, or variables declared before
`Result.pipe`. Carry all required data through the pipeline state.
