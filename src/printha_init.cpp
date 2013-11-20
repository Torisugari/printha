void init(textformat_t& aSettings) {
  aSettings.sendfrompath = "sendfrom.txt";
  aSettings.font = "IPAexMincho";
  aSettings.fontpath = "";
  aSettings.zipfont = "OCRB";
  aSettings.outputpath = "";
  aSettings.pagedelimiter = '|';
  aSettings.drawnenga = false;
  aSettings.sendfrom_zipframe_offset = point_t(0.000000, 0.000000);
  aSettings.sendfrom.dlmt = ';';
  aSettings.sendfrom.zipfontsize = 12.000000;
  aSettings.sendfrom.name.rect = rect_t(0.000000, 200.000000, 32.000000, 340.000000);
  aSettings.sendfrom.name.fontsize = 32.000000;
  aSettings.sendfrom.name.whitespace = 0.400000;
  aSettings.sendfrom.name.stretch = true ;
  aSettings.sendfrom.name.bottom = false;
  aSettings.sendfrom.name.linebreak = '\n';
  aSettings.sendfrom.addr.rect = rect_t(32.000000, 160.000000, 80.000000, 340.000000);
  aSettings.sendfrom.addr.fontsize = 20.000000;
  aSettings.sendfrom.addr.whitespace = 0.000000;
  aSettings.sendfrom.addr.stretch = false;
  aSettings.sendfrom.addr.bottom = true ;
  aSettings.sendfrom.addr.linebreak = '\n';
  aSettings.sendfrom.extra[0].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendfrom.extra[0].fontsize = 20.000000;
  aSettings.sendfrom.extra[0].whitespace = 0.000000;
  aSettings.sendfrom.extra[0].stretch = false;
  aSettings.sendfrom.extra[0].bottom = true ;
  aSettings.sendfrom.extra[0].linebreak = '\n';
  aSettings.sendfrom.extra[1].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendfrom.extra[1].fontsize = 20.000000;
  aSettings.sendfrom.extra[1].whitespace = 0.000000;
  aSettings.sendfrom.extra[1].stretch = false;
  aSettings.sendfrom.extra[1].bottom = true ;
  aSettings.sendfrom.extra[1].linebreak = '\n';
  aSettings.sendfrom.extra[2].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendfrom.extra[2].fontsize = 0.000000;
  aSettings.sendfrom.extra[2].whitespace = 0.000000;
  aSettings.sendfrom.extra[2].stretch = false;
  aSettings.sendfrom.extra[2].bottom = false;
  aSettings.sendfrom.extra[2].linebreak = '\n';
  aSettings.sendfrom.extra[3].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendfrom.extra[3].fontsize = 0.000000;
  aSettings.sendfrom.extra[3].whitespace = 0.000000;
  aSettings.sendfrom.extra[3].stretch = true ;
  aSettings.sendfrom.extra[3].bottom = false;
  aSettings.sendfrom.extra[3].linebreak = '\n';
  aSettings.sendfrom.extra[4].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendfrom.extra[4].fontsize = 0.000000;
  aSettings.sendfrom.extra[4].whitespace = 0.000000;
  aSettings.sendfrom.extra[4].stretch = true ;
  aSettings.sendfrom.extra[4].bottom = true ;
  aSettings.sendfrom.extra[4].linebreak = '\n';
  aSettings.sendfrom.extra[5].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendfrom.extra[5].fontsize = 0.000000;
  aSettings.sendfrom.extra[5].whitespace = 0.000000;
  aSettings.sendfrom.extra[5].stretch = true ;
  aSettings.sendfrom.extra[5].bottom = true ;
  aSettings.sendfrom.extra[5].linebreak = '\n';
  aSettings.sendfrom.drawzipframe = false;
  aSettings.sendto.dlmt = ';';
  aSettings.sendto.zipfontsize = 16.000000;
  aSettings.sendto.name.rect = rect_t(117.732283, 80.000000, 165.732283, 360.000000);
  aSettings.sendto.name.fontsize = 32.000000;
  aSettings.sendto.name.whitespace = 0.400000;
  aSettings.sendto.name.stretch = true ;
  aSettings.sendto.name.bottom = false;
  aSettings.sendto.name.linebreak = '\n';
  aSettings.sendto.addr.rect = rect_t(219.464567, 80.000000, 283.464567, 330.000000);
  aSettings.sendto.addr.fontsize = 20.000000;
  aSettings.sendto.addr.whitespace = 0.400000;
  aSettings.sendto.addr.stretch = false;
  aSettings.sendto.addr.bottom = true ;
  aSettings.sendto.addr.linebreak = '\n';
  aSettings.sendto.extra[0].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendto.extra[0].fontsize = 0.000000;
  aSettings.sendto.extra[0].whitespace = 0.000000;
  aSettings.sendto.extra[0].stretch = false;
  aSettings.sendto.extra[0].bottom = false;
  aSettings.sendto.extra[0].linebreak = '\n';
  aSettings.sendto.extra[1].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendto.extra[1].fontsize = 0.000000;
  aSettings.sendto.extra[1].whitespace = 0.000000;
  aSettings.sendto.extra[1].stretch = true ;
  aSettings.sendto.extra[1].bottom = true ;
  aSettings.sendto.extra[1].linebreak = '\n';
  aSettings.sendto.extra[2].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendto.extra[2].fontsize = 0.000000;
  aSettings.sendto.extra[2].whitespace = 0.000000;
  aSettings.sendto.extra[2].stretch = true ;
  aSettings.sendto.extra[2].bottom = true ;
  aSettings.sendto.extra[2].linebreak = '\n';
  aSettings.sendto.extra[3].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendto.extra[3].fontsize = 0.000000;
  aSettings.sendto.extra[3].whitespace = 0.000000;
  aSettings.sendto.extra[3].stretch = true ;
  aSettings.sendto.extra[3].bottom = true ;
  aSettings.sendto.extra[3].linebreak = '\n';
  aSettings.sendto.extra[4].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendto.extra[4].fontsize = 0.000000;
  aSettings.sendto.extra[4].whitespace = 0.000000;
  aSettings.sendto.extra[4].stretch = true ;
  aSettings.sendto.extra[4].bottom = true ;
  aSettings.sendto.extra[4].linebreak = '\n';
  aSettings.sendto.extra[5].rect = rect_t(0.000000, 0.000000, 0.000000, 0.000000);
  aSettings.sendto.extra[5].fontsize = 0.000000;
  aSettings.sendto.extra[5].whitespace = 0.000000;
  aSettings.sendto.extra[5].stretch = true ;
  aSettings.sendto.extra[5].bottom = true ;
  aSettings.sendto.extra[5].linebreak = '\n';
  aSettings.sendto.drawzipframe = false;
}
