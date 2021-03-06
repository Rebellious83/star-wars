/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common';
import { CharacterModel } from '../models/character.model';
import { CharacterPagination } from '../models/character.pagination';
import { PutCharacterDTO } from '../interfaces/update-character.dto';
import { QueryOptions } from '../configs/query-options.config';
import { Model } from 'mongoose';
import { PostCharacterDTO } from '../interfaces/post-character.dto';
@Injectable()
export class StarwarsRepository {
  async get(
    options: QueryOptions,
    characterModel: Model<CharacterModel>,
  ): Promise<CharacterPagination> {
    const totalRecords = await characterModel.countDocuments().exec();
    const totalPages =
      options.limit != null ? Math.ceil(totalRecords / options.limit) : 1;
    const characterDocs = await characterModel
      .find()
      .skip(((options.page ?? 1) - 1) * options.limit)
      .limit(options.limit)
      .lean(true)
      .exec();

    const characters: CharacterPagination = {
      currentPage: options.limit != null ? options.page ?? 1 : 1,
      totalPages: totalPages,
      totalRecords: totalRecords,
      characters: characterDocs.map((doc) => ({
        name: doc.name,
        planet: doc.planet,
        episodes: doc.episodes,
      })),
    };
    return characters;
  }

  async post(data: PostCharacterDTO, characterModel: Model<CharacterModel>) {
    const retCharacter = await characterModel.create(data);

    const result: CharacterModel = {
      name: retCharacter.name,
      episodes: retCharacter.episodes,
      planet: retCharacter.planet,
    };
    return result;
  }

  async put(
    name: string,
    character: PutCharacterDTO,
    characterModel: Model<CharacterModel>,
  ): Promise<CharacterModel> {
    const temporary: CharacterModel = {
      name: name,
      episodes: character.episodes,
      planet: character.planet,
    };
    return await characterModel
      .findOneAndUpdate(
        {
          name: name,
        },
        temporary,
        { useFindAndModify: false },
      )
      .lean(true)
      .exec();
  }

  async delete(
    name: string,
    characterModel: Model<CharacterModel>,
  ): Promise<CharacterModel> {
    const delete_model = await characterModel
      .findOneAndDelete({ name: name })
      .exec();
    return delete_model;
  }
}
