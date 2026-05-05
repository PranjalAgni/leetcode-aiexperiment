package languages

import "fmt"

type Language struct {
	Name         string
	FileExt      string
	CompileCmd   []string // nil if interpreted
	RunCmd       []string // {program, args...} — use {SOURCE_FILE} as placeholder
	TimeFactor   float64  // multiplier on base time limit for this language
}

// SOURCE_FILE is replaced with the actual source file path at runtime
const SOURCE_FILE = "{SOURCE_FILE}"
const BINARY_FILE = "{BINARY_FILE}"

var Registry = map[string]Language{
	"python3": {
		Name:    "Python 3",
		FileExt: "py",
		RunCmd:  []string{"python3", SOURCE_FILE},
		TimeFactor: 2.5,
	},
	"javascript": {
		Name:    "JavaScript (Node.js)",
		FileExt: "js",
		RunCmd:  []string{"node", SOURCE_FILE},
		TimeFactor: 2.5,
	},
	"typescript": {
		Name:    "TypeScript",
		FileExt: "ts",
		// TS is transpiled to JS before running
		RunCmd:  []string{"node", BINARY_FILE},
		TimeFactor: 3.0,
	},
	"java": {
		Name:       "Java",
		FileExt:    "java",
		CompileCmd: []string{"javac", SOURCE_FILE},
		RunCmd:     []string{"java", "-Xmx256m", "-Xms32m", "Solution"},
		TimeFactor: 2.0,
	},
	"cpp17": {
		Name:       "C++ 17",
		FileExt:    "cpp",
		CompileCmd: []string{"g++", "-O2", "-std=c++17", "-o", BINARY_FILE, SOURCE_FILE},
		RunCmd:     []string{BINARY_FILE},
		TimeFactor: 1.0,
	},
	"go": {
		Name:       "Go",
		FileExt:    "go",
		CompileCmd: []string{"go", "build", "-o", BINARY_FILE, SOURCE_FILE},
		RunCmd:     []string{BINARY_FILE},
		TimeFactor: 1.5,
	},
	"rust": {
		Name:       "Rust",
		FileExt:    "rs",
		CompileCmd: []string{"rustc", "-O", "-o", BINARY_FILE, SOURCE_FILE},
		RunCmd:     []string{BINARY_FILE},
		TimeFactor: 1.5,
	},
	"csharp": {
		Name:       "C#",
		FileExt:    "cs",
		CompileCmd: []string{"dotnet-script", "compile", SOURCE_FILE},
		RunCmd:     []string{"dotnet-script", BINARY_FILE},
		TimeFactor: 2.0,
	},
	"kotlin": {
		Name:       "Kotlin",
		FileExt:    "kt",
		CompileCmd: []string{"kotlinc", SOURCE_FILE, "-include-runtime", "-d", BINARY_FILE},
		RunCmd:     []string{"java", "-jar", BINARY_FILE},
		TimeFactor: 3.0,
	},
	"ruby": {
		Name:    "Ruby",
		FileExt: "rb",
		RunCmd:  []string{"ruby", SOURCE_FILE},
		TimeFactor: 3.0,
	},
}

func Get(lang string) (Language, error) {
	l, ok := Registry[lang]
	if !ok {
		return Language{}, fmt.Errorf("unsupported language: %s", lang)
	}
	return l, nil
}
