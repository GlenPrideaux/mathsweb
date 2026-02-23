
outputformat := "svg";
outputtemplate := "%j-%c.svg";
beginfig(1)
  pickup pencircle scaled 0.35mm;
  u=0.8cm;
  o=0.4u;
  color mygreen;
  mygreen:=(115/256,250/256,116/256);
  path p[];
  z0=(-2u,0);
  z1=z0 shifted (0,0.6u);
  z2=z1 shifted (u-0.5o,0);
  z3=z2 shifted ((u,0) rotated 135);
  z4=z3 shifted (1.414u+o,0);
  z5=z2 shifted (o,0);
  z6=z1 shifted (4u,0);
  z7=z0 shifted (4u,0);
  p0=z0--z1--z2--z3--z4--z5--z6--z7--cycle;
  p1=p0 rotated 180;
  fill p0 withcolor mygreen;
  fill p1 withcolor mygreen;
  draw p0;
  draw p1;
endfig;
end;
