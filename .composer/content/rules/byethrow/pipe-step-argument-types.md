# Pipe step argument types

Do not annotate the type of `v` in callbacks passed directly as `Result.pipe`
steps. Rely on contextual inference from the preceding pipeline state.
