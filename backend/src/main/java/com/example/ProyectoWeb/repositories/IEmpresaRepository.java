package com.example.ProyectoWeb.repositories;

import com.example.ProyectoWeb.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface IEmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByNombre(String nombre); // Buscar empresa por nombre

    List<Empresa> findAllByNombreContainingIgnoreCase(String nombre); // Buscar empresas que contengan parte del nombre (no sensible a mayúsculas)
}