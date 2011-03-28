#!/usr/local/bin/perl

use strict;

require "ufyu";

open(FH, "./test.txt") or die $!;
my $text = join '', <FH>;
close(FH);

print &ufyu::markup_blocklevel($text);

exit;
