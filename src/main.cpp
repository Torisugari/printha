/* 
 *    Copyright (C) 2013 Torisugari <torisugari@gmail.com>
 *
 *     Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 *     The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

#include <ft2build.h>
#include FT_FREETYPE_H

#include <fontconfig/fontconfig.h>

#include <stdio.h>
#include <string>
#include <iostream>
#include <sstream>
#include <fstream>

//#include "printha_settings.h"
#include "printha.h"
#include "printha_settings.h"


inline bool fileExists(const char* aFilePath) {
  std::ifstream file(aFilePath);
  return bool(file);
}

inline bool fileCopy(const char* aSource, const char* aDest) {
  std::ifstream input(aSource);
  std::ofstream output(aDest);
  output << input.rdbuf();
  return (bool(output) && bool(input));
}

//#include <sys/stat.h>
int main (int argc, char* argv[]) {

  static const char kDataDirConfigFile[] =
    PRINTHA_DATADIR "/settings/config.txt"; 
  static const char kDataDirSendFromFile[] =
    PRINTHA_DATADIR "/settings/sendfrom.txt";
  static const char kDataDirSendToFile[] =
    PRINTHA_DATADIR "/settings/sendto.txt";

#ifdef PRINTHA_USE_DEFAULT_FONT
  static const FcChar8 kDataDirFontFile[] =
    PRINTHA_DATADIR "/resources/font/ipaexm.ttf";
#endif

#ifdef PRINTHA_USE_DEFAULT_ZIPCODE_FONT
  static const FcChar8 kDataDirZipcodeFontFile[] =
    PRINTHA_DATADIR "/resources/zipfont/OCRB_aizu_1_1.ttf";
#endif
  printha::textformat_t settings;
  bool isBuildDirConfig =  printha::settings::read(kDataDirConfigFile, settings);
  if (isBuildDirConfig) {
#ifdef DEBUG
    fprintf(stderr, "Successfully loaded config file:%s\n",
                    kDataDirConfigFile);
#  ifdef PRINTHA_USE_SRCDIR_FILES
    printha::settings::write(PRINTHA_DATADIR "/src/printha_init.cpp", settings,
                    printha::settings::kWriteFormatCSRC);
#  endif
#endif
  }
  else {
    fprintf(stderr, "Missing file:%s\n", kDataDirConfigFile);
  }

  char fileNameBuffer[FILENAME_MAX];
  // XXX realpath(...) may cause buffer overflow, I'm afraid.
  realpath("printha.config.txt", fileNameBuffer);
  std::string userDirConfig = fileNameBuffer;

  printha::settings::read(userDirConfig.c_str(), settings);

  int32_t i;
  std::string sendtoData;
  bool skipPrint = false;
  settings.preview = false;
  printha::mode printMode = printha::kPDF;
  for (i = 1; i < argc; i++) {
    if ((0 == strcasecmp("-h", argv[i])) ||
        (0 == strcasecmp("--help", argv[i]))) {
      printf(
"Usage: printha [OPTION...] [DATA]\n"
"\n"
"Options:\n"
"  -h, --help            : Display this help document.\n"
"  -i, --init            : Export clean <printha.config.txt> to the current \n"
"                          working directory.\n"
"                          If <sendfrom.txt> and <sendto.txt> are missing,\n"
"                          they will also be created.\n"
"  -s, --sendfrom <file> : Set the location of the text file which contains\n"
"                          information about your name, zipcode, adress etc.\n"
"                          And this command updates <printha.config.txt>.\n"
"  -o, --output <file>   : Set PDF file location instead of stdout and\n"
"                          upadates <printha.config.txt>.\n"
"  --import <file>       : Temporarily import settings from <file> \n"
"  --export <file>       : Export current settings to <file>.\n"
"  --svg                 : Temporarily output data as a SVG file.\n"
"  --ps                  : Temporarily output data as a PostScript file.\n"
"  --preview             : Temporarily output data with background image.\n"
      );
      skipPrint = true;
    }
    else if ((0 == strcasecmp("-i", argv[i])) ||
        (0 == strcasecmp("--init", argv[i]))) {
      printha::settings::read(kDataDirConfigFile, settings);

      realpath("sendfrom.txt", fileNameBuffer);
      settings.sendfrompath = fileNameBuffer;
      if (!fileExists(fileNameBuffer)) {
        fprintf(stderr, "Creating file:%s\n", fileNameBuffer);
        fileCopy(kDataDirSendFromFile, fileNameBuffer);
      }

      realpath("sendto.txt", fileNameBuffer);
      if (!fileExists(fileNameBuffer)) {
        fprintf(stderr, "Creating file:%s\n", fileNameBuffer);
        fileCopy(kDataDirSendToFile, fileNameBuffer);
      }

      fprintf(stderr, "Saving settings at:%s\n", userDirConfig.c_str());
      printha::settings::write(userDirConfig.c_str(), settings);

      skipPrint = true;
    }
    else if ((0 == strcasecmp("-s", argv[i])) ||
             (0 == strcasecmp("--sendfrom", argv[i]))) {
      i++;
      if (i < argc) {
        if (0 != char(*argv[i])) {
          realpath(argv[i], fileNameBuffer);
          settings.sendfrompath = fileNameBuffer;
        }
        else {
          settings.sendfrompath.erase();
        }

        fprintf(stderr, "Saving settings at:%s\n", userDirConfig.c_str());
        printha::settings::write(userDirConfig.c_str(), settings);
        skipPrint = true;
      }
      else {
        fprintf(stderr, "Syntax Error. Not enough args: %s\n", argv[i-1]);
        exit(-1);
      }
    }
    else if ((0 == strcasecmp("-o", argv[i])) ||
             (0 == strcasecmp("--output", argv[i]))) {
      i++;
      if (i < argc) {
        if (0 != char(*argv[i])) {
          realpath(argv[i], fileNameBuffer);
          settings.outputpath = fileNameBuffer;
        }
        else {
          settings.outputpath.erase();
        }

        fprintf(stderr, "Saving settings at:%s\n",
                        userDirConfig.c_str());
        printha::settings::write(userDirConfig.c_str(), settings);
        skipPrint = true;
      }
      else {
        fprintf(stderr, "Syntax Error. Not enough args: %s\n", argv[i-1]); 
        exit(-1);
      }
    }
    else if (0 == strcasecmp("--import", argv[i])) {
      i++;
      if (i < argc) {
        if (0 != char(*argv[i])) {
          realpath(argv[i], fileNameBuffer);
          bool isUserDirConfig = printha::settings::read(fileNameBuffer, settings);
          if (isUserDirConfig) {
#ifdef DEBUG
            fprintf(stderr, "Successfully loaded config file:%s\n",
                    fileNameBuffer);
#endif
          }
          else {
            fprintf(stderr, "Missing file:%s\n", fileNameBuffer);
          }
        }
      }
      else {
        fprintf(stderr, "Syntax Error. Not enough args: %s\n", argv[i-1]); 
        exit(-1);
      }
    }
    else if (0 == strcasecmp("--export", argv[i])) {
      i++;
      if (i < argc) {
        if (0 != char(*argv[i])) {
          realpath(argv[i], fileNameBuffer);
          printha::settings::write(fileNameBuffer, settings);
        }
      }
      else {
        fprintf(stderr, "Syntax Error. Not enough args: %s\n", argv[i-1]); 
        exit(-1);
      }
    }
    else if (0 == strcasecmp("--svg", argv[i] )) {
      printMode = printha::kSVG;
    }
    else if (0 == strcasecmp("--ps", argv[i])) {
      printMode = printha::kPS;
    }
    else if (0 == strcasecmp("--preview", argv[i])) {
      settings.preview = true;
    }
    else {
      sendtoData = argv[i];
      skipPrint = false;
    }
  }

  if (skipPrint) {
    exit(0);
  }

  cairo_surface_t* cs =
    printha::hagaki_surface_create(settings.outputpath.c_str(), printMode);

  FT_Library ftlib;
  FT_Error fte = FT_Init_FreeType(&ftlib);

  if (fte) {
    fprintf(stderr, "FT_Init_FreeType:0x%x\n", fte);
    exit(-1);
  }

  FT_Face ftSelectedFont;

  FcInit();
#ifdef PRINTHA_USE_DEFAULT_FONT
  FcConfigAppFontAddFile(nullptr, kDataDirFontFile);
#endif
#ifdef PRINTHA_USE_DEFAULT_ZIPCODE_FONT
  FcConfigAppFontAddFile(nullptr, kDataDirZipcodeFontFile);
#endif

  int fontindex = 0;
  const char* fontpath = nullptr;
  FcPattern* fcFont = nullptr;
  if (settings.fontpath.empty()) {
    const char* fontface = (settings.font.empty())?
                             "Serif" : settings.font.c_str();
    FcPattern* pattern = FcNameParse((const FcChar8*) fontface);
    FcConfigSubstitute(nullptr, pattern, FcMatchPattern);
    FcDefaultSubstitute(pattern);

    FcResult fcResult;
    FcPatternAddBool(pattern, FC_VERTICAL_LAYOUT, FcTrue);
    fcFont = FcFontMatch(nullptr, pattern, &fcResult);
    FcPatternDestroy(pattern);

    FcChar8* ufontpath;
    FcPatternGetString(fcFont, FC_FILE, 0, &ufontpath);
    fontpath = (const char*)(ufontpath);

    FcPatternGetInteger(fcFont, FC_INDEX, 0, &fontindex);
  }
  else {
    fontpath = settings.fontpath.c_str();
  }

  fte = FT_New_Face(ftlib, fontpath, fontindex, &ftSelectedFont);
  FcPatternDestroy(fcFont);

  if (fte) {
    fprintf(stderr, "FT_New_Face:0x%x, %s\n", fte, settings.fontpath.c_str());
    exit(-1);
  }

  if (sendtoData.empty()) {
    std::cin >> std::noskipws;
    std::getline(std::cin, sendtoData, char(0));

    // XXX I'm not too sure what inserts this line feed. Shell?
    //     Cut it off anyway.
    if (sendtoData.size() > 0 && '\n' == char(*(sendtoData.end() - 1))) {
      sendtoData.resize(sendtoData.size() - 1);
    }
  }
#ifdef DEBUG
  {
    double fontsize = 20.;
    printString(ftSelectedFont, cs,
                "This is debug Mode!",
                printha::rect_t(printha::point_t(0., 0.), 40., 200.000),
                fontsize, 0.5, false, false, false,
                HB_DIRECTION_TTB);
    fontsize = 20.;
    printString(ftSelectedFont, cs,
                "This is debug Mode!",
                printha::rect_t(printha::point_t(0., 0.), 200., 40.),
                fontsize, 0.5, false, false, false,
                HB_DIRECTION_LTR);
  }
#endif
  if (!sendtoData.empty()) {
    if (printha::kSVG == printMode) {
      printha::printPage(ftSelectedFont, cs, sendtoData, settings);
    }
    else {
      std::istringstream iss(sendtoData);
      std::string row;
      while (std::getline(iss, row, settings.pagedelimiter)) {
        printha::printPage(ftSelectedFont, cs, row, settings);
      }
    }
  }

  cairo_surface_flush(cs);
  cairo_surface_destroy(cs);
  FT_Done_FreeType(ftlib);
  return 0;
}

