
export default class MapUtils {

  static toBoolByNum<T>(data: Array<T>, key: string, value: string): Map<string, boolean> {
    return (data || []).reduce((map, jsItem: any) => {
      map.set(String(jsItem[key]), jsItem[value] as boolean);
      return map;
    }, new Map<string, boolean>());
  }

  static toStringByNum<T>(data: Array<T>, key: string, value: string): Map<string, number> {
    return (data || []).reduce((map, jsItem: any) => {
      map.set(String(jsItem[key]), jsItem[value] as number);
      return map;
    }, new Map<string, number>());
  }

}
