import Database from '@ioc:Adonis/Lucid/Database'
import { Skills } from 'Contracts/enums/Skills'

export default class HighscoresService {
  public async topRankPlayers(): Promise<Object[]> {
    return await Database
      .from('players')
      .select('id', 'name', 'level', 'vocation', 'experience', 'online')
      .where('deleted', '=', 0)
      .andWhere('group_id', '<', 4)
      .orderBy('experience', 'desc')
      .limit(5);
  }
  
  public async find(page: number, limit: number, type: string): Promise<Object[]> {  
    console.log(type);
    if (type === 'Experience')  
      return await Database
        .from('players')
        .select('name', 'vocation', 'level', 'experience', 'online')
        .where('deleted', '=', 0)
        .andWhere('group_id', '<', 4)
        .orderBy('experience', 'desc')
        .paginate(page, limit);

    else if (type === 'Magic Level')
      return await Database
        .from('players')
        .select('name', 'vocation', 'maglevel as value', 'experience', 'online')
        .where('deleted', '=', 0)
        .andWhere('group_id', '<', 4)
        .orderBy('maglevel', 'desc')
        .paginate(page, limit);

    else {
      const skill = Skills.find((skill) => skill.text === type)?.value;
      
      return await Database
        .from('players')
        .innerJoin('player_skills', 'player_skills.player_id', 'players.id')
        .select('players.name', 'players.vocation', 'player_skills.value')
        .where('players.deleted', '=', 0)
        .andWhere('players.group_id', '<', 4)
        .andWhere('player_skills.skillid', '=', skill || 0)
        .orderBy('player_skills.value', 'desc')
        .paginate(page, limit);
    }
  }

  public async update(data: { id: number, name: string }): Promise<String> {
    const character = await Database
      .from('players')
      .select('id')
      .where('name', '=', data.name)
      .andWhere('id', '<>', data.id);
    
    if (character.length)
      return "Error. The username is already used.";
      
    const affectedRows = await Database.from('players').where('id', '=', data.id).update(data);

    if (!affectedRows)
      return "Character not found.";
    
    return "Character successfully updated.";
  }

}