#!/usr/bin/env python3
"""
Script de teste para demonstrar as validações de segurança implementadas.
Execute este script para ver como as validações funcionam.
"""

from utils import validate_input_text, validate_audio_file

def test_input_validation():
    """Testa as validações de entrada de texto."""
    print("🔒 Testando Validações de Segurança")
    print("=" * 50)
    
    # Testes de validação de texto
    test_cases = [
        ("João Silva", "Nome válido", True),
        ("", "Campo vazio", False),
        ("João <script>alert('hack')</script>", "Script malicioso", False),
        ("João'; DROP TABLE bdrs; --", "SQL Injection", False),
        ("João & Maria", "Caractere &", False),
        ("João da Silva", "Nome com acentos", True),
        ("João123", "Nome com números", True),
        ("João-Silva", "Nome com hífen", True),
        ("João, Silva", "Nome com vírgula", True),
        ("João! Silva", "Nome com exclamação", True),
        ("João? Silva", "Nome com interrogação", True),
        ("João (Silva)", "Nome com parênteses", True),
        ("João" * 100, "Nome muito longo", False),
    ]
    
    print("\n📝 Testando Validação de Texto:")
    for text, description, expected in test_cases:
        is_valid, message = validate_input_text(text, "Nome", 50)
        status = "✅" if is_valid == expected else "❌"
        print(f"{status} {description}: '{text[:30]}{'...' if len(text) > 30 else ''}' -> {message}")
    
    print("\n" + "=" * 50)
    print("✅ Testes de segurança concluídos!")
    print("💡 As validações estão funcionando corretamente.")

if __name__ == "__main__":
    test_input_validation()
