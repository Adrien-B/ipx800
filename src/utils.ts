
export default class MapUtils {

  static toBoolByNum<T>(data: Array<T>, key: string, value: string):Map<number, boolean> {
    return (data || []).reduce((map, jsItem) => {
      map[jsItem[key] as number] = jsItem[value] as boolean;
      return map;
    }
    , new Map<number, boolean>());
  }


  static toStringByNum<T>(data: Array<T>, key: string, value: string):Map<number, number> {
    return (data || []).reduce((map, jsItem) => {
      map[jsItem[key] as number] = jsItem[value] as number;
      return map;
    }
    , new Map<number, number>());
  }

}