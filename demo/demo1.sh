#!/bin/sh
printha --init
printha --preview < sendto.txt > 1/sendto.pdf
printha --svg < sendto.txt > 1/sendto.svg
printha --ps < sendto.txt > 1/sendto.ps
printha --import config.company.txt < sendto.txt > 1/president.pdf
printha --import config.telephone.txt< sendto.txt > 1/telephone.pdf
printha --import nenga.txt < sendto.txt > 1/nenga.pdf
rm printha.config.txt sendto.txt sendfrom.txt

