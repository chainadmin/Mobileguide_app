const { withAppBuildGradle } = require('expo/config-plugins');

const withDisableCppWarningsAsErrors = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const buildGradle = config.modResults.contents;
      
      const gradleModification = `
// Disable treating deprecation warnings as errors in C++ builds
afterEvaluate {
    tasks.configureEach { task ->
        if (task.name.contains('externalNativeBuild') || task.name.contains('CMake')) {
            task.doFirst {
                android.defaultConfig.externalNativeBuild.cmake.cppFlags += " -Wno-error=deprecated-declarations"
            }
        }
    }
}

android.packagingOptions {
    pickFirst 'lib/arm64-v8a/libc++_shared.so'
    pickFirst 'lib/armeabi-v7a/libc++_shared.so'
    pickFirst 'lib/x86/libc++_shared.so'
    pickFirst 'lib/x86_64/libc++_shared.so'
}
`;
      
      if (!buildGradle.includes('Wno-error=deprecated-declarations')) {
        config.modResults.contents = buildGradle + '\n' + gradleModification;
      }
    }
    return config;
  });
};

module.exports = withDisableCppWarningsAsErrors;
