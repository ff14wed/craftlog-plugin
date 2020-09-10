import { observable, action, computed } from 'mobx';

import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(LocalizedFormat)

function deltaString(delta: number) {
  if (delta >= 0) {
    return `(+${delta})`;
  }
  return `(${delta})`;
}

export type ConditionName = "Normal" | "Good" | "Excellent" | "Poor" | "Centered" | "Sturdy" | "Pliant";

function toConditionName(condition: number): ConditionName {
  switch (condition) {
    case 1:
      return "Normal";
    case 2:
      return "Good";
    case 3:
      return "Excellent";
    case 5:
      return "Centered";
    case 6:
      return "Sturdy";
    case 7:
      return "Pliant";
  }
  return "Poor";
}

export interface Recipe {
  id: number;
  name: string;
  recipeLevel: number;
  element: number;
  canHQ: boolean;
  difficulty: number;
  quality: number;
  durability: number;
}

export interface CraftInfo {
  recipe: Recipe;

  lastCraftActionID: number;
  lastCraftActionName: string;
  stepNum: number;

  progress: number;
  progressDelta: number;

  quality: number;
  qualityDelta: number;

  hqChance: number;

  durability: number;
  durabilityDelta: number;

  currentCondition: number;
  previousCondition: number;

  reuseProc: boolean;
}

export interface DisplayCraftInfo {
  id: string;
  Completed: string;
  Failed: string;

  RecipeID: number;
  RecipeName: string;
  RecipeLevel: number;
  StepNum: number;
  Durability: string;
  Progress: string;
  Quality: string;
  HQChance: string;
  PreviousCondition: ConditionName;
  CurrentCondition: ConditionName;
  LastCraftAction: string;
  ReuseProc: string;
}


export default class Craft {
  date = 0;
  recipe: Recipe;

  @observable history: DisplayCraftInfo[] = [];
  @observable stepNum = 0;

  @observable durability = 0;
  @observable durabilityDelta = 0;

  @observable progress = 0;
  @observable progressDelta = 0;

  @observable quality = 0;
  @observable qualityDelta = 0;
  @observable hqChance = 1;

  @observable previousCondition = 1;
  @observable currentCondition = 1;

  @observable lastCraftActionID = 0;
  @observable lastCraftActionName = "";

  @observable completed = false;
  @observable failed = false;

  @observable reuseProc = false;

  constructor(initialCraftInfo: CraftInfo) {
    let { recipe, stepNum } = initialCraftInfo;
    this.recipe = recipe;
    this.stepNum = stepNum;

    this.date = Date.now();
  }

  @action craftingEvent(craftingInfo: CraftInfo) {
    if (craftingInfo.stepNum === 0) {
      this.failed = true;
      return;
    }
    if (craftingInfo.lastCraftActionID <= 0) {
      return;
    }

    if (craftingInfo.stepNum === this.stepNum) {
      this.completed = true;
    } else {
      this.stepNum = craftingInfo.stepNum;
    }

    this.durability = craftingInfo.durability;
    this.durabilityDelta = craftingInfo.durabilityDelta;

    this.progress = craftingInfo.progress;
    this.progressDelta = craftingInfo.progressDelta;

    this.quality = craftingInfo.quality;
    this.qualityDelta = craftingInfo.qualityDelta;

    this.hqChance = craftingInfo.hqChance;

    this.previousCondition = craftingInfo.previousCondition;
    this.currentCondition = craftingInfo.currentCondition;

    this.lastCraftActionID = craftingInfo.lastCraftActionID;
    this.lastCraftActionName = craftingInfo.lastCraftActionName;

    this.reuseProc = craftingInfo.reuseProc;

    let hist = Object.assign({}, this.info);
    hist.id = `${Date.now()}`;
    this.history.push(hist);
  }

  @computed get id() {
    return dayjs(this.date).format();
  }

  @computed get timestamp() {
    return dayjs(this.date).format('l h:mm:ss a');
  }

  @computed get numSteps() {
    return this.history.length;
  }

  @computed get condition() {
    return toConditionName(this.currentCondition);
  }

  @computed get info(): DisplayCraftInfo {
    return {
      id: this.id,
      Completed: `${this.completed}`,
      Failed: `${this.failed}`,

      RecipeID: this.recipe.id,
      RecipeName: this.recipe.name,
      RecipeLevel: this.recipe.recipeLevel,
      StepNum: this.stepNum,
      Durability: `${this.durability} / ${this.recipe.durability} ${deltaString(this.durabilityDelta)}`,
      Progress: `${this.progress} / ${this.recipe.difficulty} ${deltaString(this.progressDelta)}`,
      Quality: `${this.quality} / ${this.recipe.quality} ${deltaString(this.qualityDelta)}`,
      HQChance: `${this.hqChance}%`,
      PreviousCondition: toConditionName(this.previousCondition),
      CurrentCondition: toConditionName(this.currentCondition),
      LastCraftAction: `${this.lastCraftActionName} (${this.lastCraftActionID})`,
      ReuseProc: `${this.reuseProc}`,
    }
  }
}
