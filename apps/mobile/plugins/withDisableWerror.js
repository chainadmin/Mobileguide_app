const { withGradleProperties, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withDisableWerror(config) {
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const gradlePropertiesPath = path.join(
        projectRoot,
        "android",
        "gradle.properties"
      );

      if (fs.existsSync(gradlePropertiesPath)) {
        let content = fs.readFileSync(gradlePropertiesPath, "utf-8");
        if (!content.includes("reactNativeArchitectures")) {
          content += "\nreactNativeArchitectures=arm64-v8a,armeabi-v7a,x86,x86_64\n";
        }
        fs.writeFileSync(gradlePropertiesPath, content);
      }

      const buildGradlePath = path.join(
        projectRoot,
        "android",
        "app",
        "build.gradle"
      );

      if (fs.existsSync(buildGradlePath)) {
        let content = fs.readFileSync(buildGradlePath, "utf-8");
        
        const cxxFlagsConfig = `
android {
    defaultConfig {
        externalNativeBuild {
            cmake {
                cppFlags "-Wno-error=deprecated-declarations"
            }
        }
    }
}
`;
        if (!content.includes("Wno-error=deprecated-declarations")) {
          const androidIndex = content.indexOf("android {");
          if (androidIndex !== -1) {
            const insertPoint = content.indexOf("{", androidIndex) + 1;
            const defaultConfigBlock = `
    defaultConfig {
        externalNativeBuild {
            cmake {
                cppFlags "-Wno-error=deprecated-declarations"
            }
        }
    }`;
            if (!content.includes("externalNativeBuild")) {
              content = content.slice(0, insertPoint) + defaultConfigBlock + content.slice(insertPoint);
              fs.writeFileSync(buildGradlePath, content);
            }
          }
        }
      }

      return config;
    },
  ]);

  return config;
}

module.exports = withDisableWerror;
