import React from "react";
import { Composition, Still } from "remotion";
import { CitybotSheet } from "./compositions/CitybotSheet";

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="CitybotSheet" component={CitybotSheet} width={1920} height={1080} />
  </>
);
