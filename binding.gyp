{
  "targets": [
    {
      "target_name": "keyboard",
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "conditions": [
        ["OS=='mac'", {
          "sources": [ "native/keyboard.cc" ],
          "xcode_settings": {
            "OTHER_CPLUSPLUSFLAGS": ["-std=c++17", "-stdlib=libc++"],
            "OTHER_LDFLAGS": [
              "-framework Carbon",
              "-framework ApplicationServices"
            ],
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "MACOSX_DEPLOYMENT_TARGET": "10.14",
            "CLANG_CXX_LANGUAGE_STANDARD": "c++17"
          }
        }],
        ["OS=='win'", {
          "sources": [ "native/keyboard_win.cc" ],
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1,
              "AdditionalOptions": ["/std:c++17"]
            },
            "VCLinkerTool": {
              "AdditionalDependencies": ["user32.lib"]
            }
          }
        }]
      ]
    }
  ]
}

