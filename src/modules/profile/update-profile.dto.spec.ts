import { validate } from 'class-validator';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

describe('UpdateProfileDto', () => {
  it('debería pasar la validación si el DTO está vacío (todos los campos son opcionales)', async () => {
    const dto = new UpdateProfileDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería pasar la validación con datos válidos', async () => {
    const dto = new UpdateProfileDto();
    dto.name = 'Juan';
    dto.phone = '3001234567';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si name no es un string', async () => {
    const dto = new UpdateProfileDto();
    (dto as any).name = 12345;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isString).toBe('El nombre debe ser texto');
  });

  it('debería fallar si phone no es un string', async () => {
    const dto = new UpdateProfileDto();
    (dto as any).phone = 3001234567;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isString).toBe('El teléfono debe ser texto');
  });

  it('debería fallar si la contraseña es menor a 6 caracteres', async () => {
    const dto = new UpdateProfileDto();
    dto.password = '12345';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.minLength).toBe(
      'La contraseña debe tener al menos 6 caracteres',
    );
  });
});
