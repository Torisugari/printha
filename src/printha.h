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
 *     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
#ifndef __PRINTHA_HEADER__
#define __PRINTHA_HEADER__
#include <string>

#include <ft2build.h>
#include FT_FREETYPE_H

#include <cairo.h>
#include <harfbuzz/hb.h>

namespace printha {

struct point_t {
  point_t () {}
  point_t (double aX, double aY): mX(aX), mY(aY) {}
  point_t (const point_t& aPoint): mX(aPoint.mX), mY(aPoint.mY) {}
  double mX, mY;
};

struct rect_t {
  rect_t () {}
  rect_t (const point_t& aStart, const point_t& aEnd):
    mStart(aStart), mEnd(aEnd) {}
  rect_t (double aSX, double aSY, double aEX, double aEY):
    mStart(aSX, aSY), mEnd(aEX, aEY){}
  rect_t (const point_t& aStart, double aWidth, double aHeight):
    mStart(aStart),
    mEnd(point_t(aStart.mX + aWidth, aStart.mY + aHeight)) {}
  rect_t (const rect_t& aRect):
    mStart(aRect.mStart), mEnd(aRect.mEnd) {}
  double width() const {
    return mEnd.mX - mStart.mX;
  }
  double height() const {
    return mEnd.mY - mStart.mY;
  }
  point_t mStart, mEnd;
};

struct frameformat_t {
  rect_t rect;        // pt.
  double fontsize;    // pt.
  double whitespace;
  bool stretch;
  bool bottom;
  char linebreak;
};

struct personformat_t {
  char dlmt;
  double zipfontsize;     //Pt
  frameformat_t name;
  frameformat_t addr;
  frameformat_t extra[6];
  bool drawzipframe;
};

struct textformat_t {
  std::string sendfrompath;
  std::string outputpath;
  std::string font;
  std::string fontpath;
  std::string zipfont;
  char pagedelimiter;
  bool drawnenga;
  bool preview;
  point_t sendfrom_zipframe_offset;      //mm
  personformat_t sendto;
  personformat_t sendfrom;
};

enum mode {
  kPDF,
  kSVG,
  kPS
};

cairo_surface_t* hagaki_surface_create(const char* aFileName, mode aMode);

void printPage(FT_Face aFont, cairo_surface_t* aCS,
               const std::string& aString, textformat_t& aSettings);

void printLines(FT_Face aFont, cairo_surface_t* aCS,
                const std::string& aString, const frameformat_t& aFrame);

double printString(FT_Face aFTSelectedFont, cairo_surface_t* aCS,
                   const char* aString, const rect_t& aRect,
                   double& aMaxFontSize, double aWhiteSpace,
                   bool aStretch, bool aBottom = false, bool aRed = false,
                   hb_direction_t aDirection = HB_DIRECTION_TTB);

}
#endif
